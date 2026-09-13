import { NextResponse } from 'next/server';
import { modes,env } from '@/lib/server/integrations/config';
import { identity } from '@/lib/server/integrations/auth';
import { readState,sameScope } from '@/lib/server/integrations/state';
import { errorResponse } from '@/lib/server/integrations/api';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  try {
    if(modes().vector==='legacy') {
      const response=await fetch((env('NEXT_PUBLIC_API_URL')||'http://127.0.0.1:8000')+'/api/evaluation',{signal:AbortSignal.timeout(5000),cache:'no-store'});
      if(!response.ok)return NextResponse.json({detail:'Legacy demo evaluation unavailable'},{status:503});
      return NextResponse.json({...await response.json(),provider:'local fallback',demo:true});
    }
    const scope=await identity(request);const state=await readState();
    const allowed=(e:{tenant:string;plant:string;permission_scope:string[]})=>sameScope(e,scope)&&e.permission_scope.some(r=>r==='plant'||r===scope.role);
    const runs=state.executions.filter(e=>sameScope(e.scope,scope)&&e.evidence.every(allowed));const claims=runs.flatMap(e=>e.claims);
    return NextResponse.json({provider:'qdrant / lyzr execution records',documents_processed:new Set(state.documents.filter(allowed).map(e=>e.document_id)).size,entity_extraction_precision_estimate:null,entity_extraction_recall_estimate:null,chunk_retrieval_quality:null,citation_coverage:claims.length?claims.filter(c=>c.citations.length>0).length/claims.length:null,unanswered_due_to_insufficient_evidence:runs.filter(e=>e.status==='failed'||!e.claims.some(c=>c.kind==='fact')).length,compliance_gaps_found:null,repeated_failure_patterns_detected:null,executions:runs.length});
  } catch(error){return errorResponse(error);}
}
