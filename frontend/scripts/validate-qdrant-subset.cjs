// Explicitly bounded validation. Never deletes, migrates, activates providers or deploys.
require('./register-typescript.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {hash,readState,transaction,auditEvent}=require('../lib/server/integrations/state.ts');
const {chunksFor}=require('../lib/server/integrations/ingestion.ts');
const {QdrantProvider,pointId,scopeFilter}=require('../lib/server/integrations/qdrant.ts');
const {FastEmbedProvider}=require('../lib/server/integrations/fastembed.ts');
const {verifyClaims}=require('../lib/server/integrations/workflow.ts');
const {healthReport}=require('../lib/server/integrations/factory.ts');
const {baseUrl}=require('../lib/server/integrations/config.ts');

async function main(){
 assert.ok(process.argv.includes('--apply-approved-subset'),'Explicit subset approval flag required');
 for(const line of fs.readFileSync('.env.providers.local','utf8').split(/\r?\n/)){const i=line.indexOf('=');if(i>0)process.env[line.slice(0,i)]=line.slice(i+1);}
 assert.equal(process.env.QDRANT_COLLECTION,'industrial_brain_evidence_v1');
 assert.equal(process.env.OMI_ORGANIZATION_ID,'industrial-brain-ai');assert.equal(process.env.OMI_PLANT_ID,'plant-a');
 const scope={sub:'approved-validation-cli',tenant:'industrial-brain-ai',plant:'plant-a',organization_id:'industrial-brain-ai',plant_id:'plant-a',role:'plant_manager'};
 const base=baseUrl('QDRANT_URL')+'/collections/industrial_brain_evidence_v1';
 async function api(suffix='',method='GET',body){const r=await fetch(base+suffix,{method,headers:{'api-key':process.env.QDRANT_API_KEY,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)throw Error('Qdrant request failed: HTTP '+r.status);return r.json();}
 const root=path.resolve('..');
 function legacySnapshot(){const entries={};function walk(dir){if(!fs.existsSync(dir))return;for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())walk(p);else if(f.isFile())entries[path.relative(root,p)]=hash(fs.readFileSync(p).toString('base64'));}}for(const p of ['demo-data','frontend/.uploads','backend/app/data','backend/app/uploads','backend/storage'])walk(path.join(root,p));return entries;}
 const before=legacySnapshot();const report={started_at:new Date().toISOString(),collection:'industrial_brain_evidence_v1',validation_only:true,scope:{organization_id:scope.tenant,plant_id:scope.plant},tests:{}};
 const source=(filename)=>fs.readFileSync(path.join(root,'demo-data',filename),'utf8');
 const csv=source('maintenance_work_orders.csv');const maintenance=csv.split(/\r?\n/).find(l=>l.startsWith('WO-10877,P101,'));assert.ok(maintenance);
 const unrelated=source('quality_issue_QA12.txt');const inspection=source('inspection_report_P101.txt');
 const specs=[{label:'maintenance',filename:'maintenance_work_orders.csv',text:maintenance,type:'Maintenance validation',section:'CSV row 2: WO-10877',timestamp:'2026-02-19T00:00:00Z',permission:['plant']},{label:'unrelated',filename:'quality_issue_QA12.txt',text:unrelated,type:'Quality validation',section:'Complete demo QA12 record',timestamp:'2026-04-02T00:00:00Z',permission:['plant']},{label:'restricted',filename:'inspection_report_P101.txt',text:inspection,type:'Inspection validation',section:'Complete demo P101 inspection',timestamp:'2026-02-20T00:00:00Z',permission:['plant_manager']}];
 const items=specs.map(s=>{assert.ok(source(s.filename).includes(s.text));const list=chunksFor(s.text,{document_id:'validation-v1-'+s.label,filename:s.filename,doc_type:s.type,section:s.section,timestamp:s.timestamp},scope);assert.equal(list.length,1);return {...list[0],permission_scope:s.permission,document_type:s.type,source_id:'demo-data/'+s.filename,validation_only:true,validation_set:'approved-subset-v1'};});
 assert.ok(items.length<=20);report.omi={approved_available:(await readState()).observations.filter(o=>o.status==='approved'&&o.reviewed_by&&o.reviewed_at&&o.organization_id===scope.tenant&&o.plant_id===scope.plant).length,included:false,reason:'No pre-approved Omi record available at validation preparation; no approval manufactured'};
 const embedder=new FastEmbedProvider();const vectors=await embedder.embed(items.map(e=>e.text));
 function validate(v,count){assert.equal(v.length,count);for(const row of v){assert.ok(Array.isArray(row));assert.equal(row.length,384);assert.ok(row.every(n=>typeof n==='number'&&Number.isFinite(n)));}}
 validate(vectors,items.length);report.vector_validation={passed:true,count:vectors.length,dimensions:384,all_finite:true};console.log('PASS all '+vectors.length+' vectors validated before any upsert');
 const exists=await api('/exists');if(!exists.result.exists){await api('','PUT',{vectors:{size:384,distance:'Cosine'}});await transaction(s=>auditEvent(s,scope,'qdrant.validation.collection_created',report.collection,'User-approved 384/Cosine collection'));report.collection_created=true;}else report.collection_created=false;
 let info=(await api()).result;assert.deepEqual(info.config.params.vectors,{size:384,distance:'Cosine'});report.schema=info.config.params.vectors;
 const indexes={tenant:'keyword',plant:'keyword',organization_id:'keyword',plant_id:'keyword',asset_tag:'keyword',document_id:'keyword',document_type:'keyword',doc_type:'keyword',permission_scope:'keyword',source_id:'keyword',content_hash:'keyword',ingestion_version:'keyword',omi_conversation_id:'keyword',timestamp:'datetime'};
 for(const [field,type] of Object.entries(indexes)){const current=info.payload_schema?.[field];if(current){assert.equal(current.data_type,type);continue;}await api('/index?wait=true','PUT',{field_name:field,field_schema:type});}
 info=(await api()).result;for(const [field,type] of Object.entries(indexes))assert.equal(info.payload_schema?.[field]?.data_type,type);report.payload_indexes=indexes;
 await transaction(s=>auditEvent(s,scope,'qdrant.validation.indexes_verified',report.collection,Object.keys(indexes).join(', ')));
 async function count(){return (await api('/points/count','POST',{exact:true})).result.count;}
 const initial=await count();assert.ok(initial<=20);if(initial){const existing=(await api('/points/scroll','POST',{limit:21,with_payload:true,with_vector:false})).result.points;assert.equal(existing.length,initial);assert.ok(existing.every(p=>items.some(e=>pointId(e.id)===p.id)&&p.payload.validation_set==='approved-subset-v1'),'Refuse to alter a collection containing non-validation data');}
 // Exercise the actual adapter with pre-verified real FastEmbed vectors, not mock vectors.
 const vectorProvider=new QdrantProvider({dimension:384,embed:async(texts,purpose)=>{if(purpose==='query'){const v=await embedder.embed(texts,'query');validate(v,texts.length);return v;}assert.deepEqual(texts,items.map(e=>e.text));validate(vectors,texts.length);return vectors;}});
 await transaction(s=>auditEvent(s,scope,'qdrant.validation.upsert_requested',report.collection,`${items.length} approved validation chunks`));
 await vectorProvider.upsert(items);const first=await count();assert.equal(first,items.length);
 await transaction(s=>{for(const item of items){const index=s.documents.findIndex(e=>e.id===item.id);if(index<0)s.documents.push(item);else s.documents[index]=item;}auditEvent(s,scope,'qdrant.validation.upsert_completed',report.collection,`${first} points counted exactly`);});
 await vectorProvider.upsert(items);const repeated=await count();assert.equal(repeated,first);report.idempotency={passed:true,initial_count:initial,after_first:first,after_repeat:repeated};
 const question='Pump P101 repeated mechanical seal failure vibration maintenance suction pressure seal flush';const q=(await embedder.embed([question],'query'))[0];validate([q],1);
 async function search(filter){return (await api('/points/query','POST',{query:q,filter,limit:20,with_payload:true,with_vector:false})).result.points;}
 const manager=await search(scopeFilter(scope));const operatorScope={...scope,role:'operator'};const operator=await search(scopeFilter(operatorScope));
 const score=label=>manager.find(p=>p.payload.document_id==='validation-v1-'+label)?.score;
 assert.ok(score('maintenance')>score('unrelated'));assert.ok(score('restricted')>score('unrelated'));report.retrieval={passed:true,maintenance_score:score('maintenance'),unrelated_score:score('unrelated'),restricted_inspection_score:score('restricted'),scores_are_similarity_not_confidence:true};
 assert.equal(manager.length,3);assert.equal(operator.length,2);assert.ok(!operator.some(p=>p.payload.document_id==='validation-v1-restricted'));
 assert.equal((await search(scopeFilter({...scope,tenant:'validation-other-organization'}))).length,0);assert.equal((await search(scopeFilter({...scope,plant:'validation-other-plant'}))).length,0);
 // Independently alter canonical aliases to prove they are applied, not just legacy tenant/plant fields.
 for(const field of ['organization_id','plant_id']){const f=scopeFilter(scope);f.must.find(c=>c.key===field).match.value='validation-forbidden';assert.equal((await search(f)).length,0);}
 const assetResults=await search(scopeFilter(scope,'P101'));assert.equal(assetResults.length,2);assert.ok(assetResults.every(p=>p.payload.asset_tag.includes('P101')));
 report.filters={passed:true,manager_count:manager.length,operator_count:operator.length,restricted_excluded_for_operator:true,wrong_organization_count:0,wrong_plant_count:0,canonical_aliases_independently_checked:true,asset_filter_count:assetResults.length};
 for(const point of manager){const expected=items.find(e=>e.id===point.payload.id);assert.ok(expected);assert.deepEqual(point.payload,expected);assert.equal(point.id,pointId(expected.id));assert.ok(source(expected.filename).includes(point.payload.text));verifyClaims([{kind:'fact',text:point.payload.text,citations:[point.payload.id]}],[point.payload]);}
 report.citations={passed:true,exact_payload_roundtrip:true,exact_original_passages:true,stable_ids:true,unknown_pages_remain_null:true};
 const actualOperator=await vectorProvider.search(question,operatorScope);assert.ok(actualOperator.some(e=>e.document_id==='validation-v1-maintenance'));assert.ok(!actualOperator.some(e=>e.document_id==='validation-v1-restricted'));report.adapter_retrieval={passed:true,operator_result_count:actualOperator.length};
 assert.deepEqual(legacySnapshot(),before);report.legacy={unchanged:true,files_hashed:Object.keys(before).length};
 const h=await healthReport();assert.equal(h.providers.qdrant.status,'healthy');assert.equal(h.providers.qdrant.vector_count,items.length);assert.equal(h.ready,false);assert.ok(h.configuration.includes('migration'));report.health={qdrant_status:h.providers.qdrant.status,vector_count:h.providers.qdrant.vector_count,ready:h.ready,readiness_blocker:h.configuration};
 report.finished_at=new Date().toISOString();report.verdict='READY FOR FULL QDRANT MIGRATION';
 await transaction(s=>auditEvent(s,scope,'qdrant.validation.completed',report.collection,'Retrieval, permissions, citations, idempotency and legacy preservation passed; full migration not performed'));
 const reportPath=path.resolve(process.env.INTEGRATION_DATA_DIR||'.integration-data','qdrant-validation-report.local.json');fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(JSON.stringify({verdict:'QDRANT VALIDATION FAILED',error:e.code||'validation_error',detail:typeof e.message==='string'&&!e.message.includes('https:')?e.message:'Validation stopped; no automatic deletion or recreation'}));process.exitCode=1;});
