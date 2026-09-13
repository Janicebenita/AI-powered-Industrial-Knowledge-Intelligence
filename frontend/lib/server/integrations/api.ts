import { NextResponse } from 'next/server';
import { identity,bodyObject,textField,sameOrigin,rateLimit,login } from './auth';
import { IntegrationError,env,modes,production } from './config';
import { providers,healthReport } from './factory';
import { normalizeConversation } from './omi';
import { auditEvent,readState,sameScope,transaction } from './state';
import { observationEvidence,indexEvidence,requireOmiScope } from './ingestion';
import { specialistNames,workflowCapability,resultFor } from './workflow';
export function errorResponse(error:unknown) { return NextResponse.json({provider:'unavailable',detail:error instanceof IntegrationError?error.message:'Integration request failed',code:error instanceof IntegrationError?error.code:'internal_error'},{status:error instanceof IntegrationError?error.status:500}); }
export async function integrationApi(request:Request,parts:string[]) {
  try {
    const method=request.method; const route=parts.join('/');
    if(method!=='GET')sameOrigin(request);
    if(route==='health' && method==='GET')return NextResponse.json(await healthReport());
    if(route==='session' && method==='POST') {
      rateLimit('login',10);const body=await bodyObject(request); const token=await login(textField(body.email,'email',200),textField(body.password,'password',200));
      return NextResponse.json({status:'signed_in'},{headers:{'Set-Cookie':`industrial_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${production()?'; Secure':''}`}});
    }
    if(route==='session' && method==='DELETE')return NextResponse.json({status:'signed_out'},{headers:{'Set-Cookie':'industrial_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'}});
    if(parts[0]==='workflow' && ['retrieve','trace'].includes(parts[2]) && method==='POST') {
      const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';const run=await workflowCapability(parts[1],token);rateLimit('workflow:'+run.id,30);
      if(parts[2]==='retrieve') {
        // The callback cannot widen scope, select another tenant, or issue arbitrary queries.
        const items=await providers().vector.search(run.question,run.scope);
        await transaction(s=>{const target=s.executions.find(e=>e.id===run.id)!;if(target.status!=='running')throw new IntegrationError('conflict','Execution already ended',409);target.evidence=items;auditEvent(s,run.scope,'qdrant.retrieval',run.id,`${items.length} chunks retrieved`);});
        return NextResponse.json({provider:'qdrant',evidence:items.map(e=>({id:e.id,text:e.text,filename:e.filename,section:e.section,page_number:e.page_number,asset_tag:e.asset_tag,omi_conversation_id:e.omi_conversation_id})),insufficient_evidence:items.length===0});
      }
      const body=await bodyObject(request); const name=textField(body.name,'name',100);const status=textField(body.status,'status',20);
      if(!specialistNames.includes(name)||!['running','complete','failed'].includes(status))throw new IntegrationError('invalid_input','Unknown workflow step or status',400);
      await transaction(s=>{const target=s.executions.find(e=>e.id===run.id)!;if(target.status!=='running')throw new IntegrationError('conflict','Execution already ended',409);const prior=target.steps.find(step=>step.name===name);if(status==='running'){if(prior)throw new IntegrationError('conflict','Step already started',409);target.steps.push({name,status,started_at:new Date().toISOString(),provider:'lyzr'});}else {if(!prior||prior.status!=='running')throw new IntegrationError('conflict','Step start required before completion',409);prior.status=status;prior.ended_at=new Date().toISOString();prior.evidence_count=target.evidence.length;}auditEvent(s,run.scope,'lyzr.step.'+status,run.id,name);});
      return NextResponse.json({recorded:true});
    }
    const scope=await identity(request,method==='GET'?'read':route.endsWith('/approve')||route.endsWith('/reject')||route.endsWith('/review')?'approve':route==='qdrant/initialize'?'admin':'write');
    rateLimit(scope.sub,30);
    if(route==='session' && method==='GET')return NextResponse.json(scope);
    if(route==='omi/conversations' && method==='GET') {requireOmiScope(scope);if(modes().voice!=='omi')throw new IntegrationError('disabled','Omi capture disabled');const offset=Number(new URL(request.url).searchParams.get('offset')||0);if(!Number.isInteger(offset)||offset<0||offset>10000)throw new IntegrationError('invalid_input','Invalid offset',400);return NextResponse.json({provider:'omi',conversations:await providers().conversation.list(offset)});}
    if(route==='omi/import' && method==='POST') {
      requireOmiScope(scope);if(modes().voice!=='omi')throw new IntegrationError('disabled','Omi capture disabled');const body=await bodyObject(request);const id=textField(body.conversation_id,'conversation_id',200);
      const observation=normalizeConversation(await providers().conversation.get(id),scope);
      if(observation.conversation_id!==id)throw new IntegrationError('invalid_response','Omi conversation ID mismatch');
      const saved=await transaction(s=>{const prior=s.observations.find(o=>sameScope(o,scope)&&(o.source_id===id||o.content_hash===observation.content_hash));if(prior)return prior;s.observations.push(observation);auditEvent(s,scope,'omi.import',observation.id);return observation;});
      return NextResponse.json(saved);
    }
    if(route==='omi/status' && method==='GET') { const observations=(await readState()).observations.filter(o=>sameScope(o,scope));return NextResponse.json({provider:modes().voice==='omi'?'omi':'unavailable',sync_enabled:env('OMI_SYNC_ENABLED')==='true',synchronization:'manual pull with user review',last_sync:observations.at(-1)?.imported_at||null,observations}); }
    if(parts[0]==='omi'&&parts[1]==='records') {
      requireOmiScope(scope);
      const id=parts[2];const record=(await readState()).observations.find(o=>o.id===id&&sameScope(o,scope));if(!record)throw new IntegrationError('not_found','Observation not found',404);
      if(method==='GET')return NextResponse.json(record);
      if(method==='POST'&&['approve','reject'].includes(parts[3])) {
        const decision=parts[3]==='approve'?'approved':'rejected';
        await transaction(s=>{const o=s.observations.find(o=>o.id===id)!;if(o.status!=='pending'&&o.status!==decision)throw new IntegrationError('conflict','Observation already reviewed',409);if(o.status==='pending'){o.status=decision;o.reviewed_by=scope.sub;o.reviewed_at=new Date().toISOString();auditEvent(s,scope,'record.'+decision,id);}});
        if(decision==='approved') {
          const approved=(await readState()).observations.find(o=>o.id===id)!;
          const evidence=observationEvidence(approved,scope);
          try {await indexEvidence(evidence,scope);await transaction(s=>{s.observations.find(o=>o.id===id)!.indexing='indexed';});}catch(e){await transaction(s=>{s.observations.find(o=>o.id===id)!.indexing='failed';});throw e;}
        }
        return NextResponse.json((await readState()).observations.find(o=>o.id===id));
      }
    }
    if(route==='qdrant/initialize'&&method==='POST') { if(env('ALLOW_EXTERNAL_RESOURCE_CREATION')!=='true')throw new IntegrationError('approval_required','Collection initialization requires prior external-resource approval',403);await providers().vector.initialize();await transaction(s=>auditEvent(s,scope,'qdrant.collection.initialized',env('QDRANT_COLLECTION')));return NextResponse.json(await providers().vector.health()); }
    if(route==='qdrant/reindex'&&method==='POST') {const items=(await readState()).documents.filter(e=>sameScope(e,scope));await indexEvidence(items,scope);return NextResponse.json({provider:'qdrant',acknowledged_chunks:items.length});}
    if(parts[0]==='evidence'&&method==='GET') {const item=(await readState()).documents.find(e=>e.id===parts[1]&&sameScope(e,scope)&&e.permission_scope.some(r=>r==='plant'||r===scope.role));if(!item)throw new IntegrationError('not_found','Evidence not found',404);return NextResponse.json(item);}
    if(route==='executions'&&method==='GET')return NextResponse.json((await readState()).executions.filter(e=>sameScope(e.scope,scope)&&e.evidence.every(item=>item.permission_scope.some(r=>r==='plant'||r===scope.role))).map(resultFor));
    if(parts[0]==='executions'&&parts[2]==='export'&&method==='GET') {
      const run=(await readState()).executions.find(e=>e.id===parts[1]&&sameScope(e.scope,scope)&&e.evidence.every(item=>item.permission_scope.some(r=>r==='plant'||r===scope.role)));
      if(!run)throw new IntegrationError('not_found','Execution not found',404);
      await transaction(s=>auditEvent(s,scope,'export.execution',run.id));
      return NextResponse.json(resultFor(run),{headers:{'Content-Disposition':`attachment; filename="execution-${run.id}.json"`,'Cache-Control':'no-store'}});
    }
    if(parts[0]==='executions'&&parts[2]==='review'&&method==='POST') {
      const body=await bodyObject(request);if(!['reviewed','rejected'].includes(String(body.decision)))throw new IntegrationError('invalid_input','Review decision required',400);
      await transaction(s=>{const e=s.executions.find(e=>e.id===parts[1]&&sameScope(e.scope,scope));if(!e)throw new IntegrationError('not_found','Execution not found',404);if(e.status!=='complete')throw new IntegrationError('conflict','Only completed executions may be reviewed',409);e.review={actor:scope.sub,decision:body.decision as 'reviewed'|'rejected',at:new Date().toISOString()};auditEvent(s,scope,'human.review',e.id,String(body.decision));});
      return NextResponse.json({status:'review_recorded',operational_approval:false,detail:'This records evidence review only. Permits and field authorization remain separate.'});
    }
    if(route==='audit'&&method==='GET') {await identity(request,'admin');return NextResponse.json((await readState()).audit.filter(e=>sameScope(e,scope)));}
    throw new IntegrationError('not_found','Integration route not found',404);
  }catch(error){return errorResponse(error);}
}
