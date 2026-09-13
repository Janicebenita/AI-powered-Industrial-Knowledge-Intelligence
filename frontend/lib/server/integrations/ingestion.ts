import { hash,transaction,auditEvent } from './state';
import { providers } from './factory';
import { omiAssignment,IntegrationError } from './config';
import type { Evidence,Scope } from './contracts';
export function chunksFor(text:string,metadata:{document_id:string;filename:string;doc_type:string;timestamp?:string|null;omi_conversation_id?:string;page_number?:number|null;section?:string},scope:Scope):Evidence[] {
  const chunks:Evidence[]=[];
  for(let start=0;start<text.length;start+=900) {
    const chunk=text.slice(start,start+900); if(!chunk.trim())continue;
    const content_hash=hash(chunk);
    chunks.push({id:hash([scope.tenant,scope.plant,metadata.document_id,metadata.page_number,start,content_hash].join(':')),document_id:metadata.document_id,text:chunk,tenant:scope.tenant,plant:scope.plant,organization_id:scope.tenant,plant_id:scope.plant,permission_scope:['plant'],filename:metadata.filename,doc_type:metadata.doc_type,section:metadata.section||`Characters ${start+1}–${start+chunk.length}`,page_number:metadata.page_number??null,timestamp:metadata.timestamp||null,asset_tag:[...new Set((chunk.match(/\b(?:P|C|HX|V|B|EP)-?\d{3,6}\b/gi)||[]).map(t=>t.replace('-','').toUpperCase()))],content_hash,ingestion_version:'v2',...(metadata.omi_conversation_id?{omi_conversation_id:metadata.omi_conversation_id}:{})});
  }
  return chunks;
}
export async function indexEvidence(items:Evidence[],scope:Scope) {
  if(!items.length) throw new IntegrationError('invalid_input','No evidence to index',422);
  await transaction(s=>{for(const item of items){const index=s.documents.findIndex(e=>e.id===item.id);if(index<0)s.documents.push(item);else s.documents[index]=item;}auditEvent(s,scope,'qdrant.indexing.requested',items[0].document_id,`${items.length} chunks retained for resumable indexing`);});
  try { await providers().vector.upsert(items); await transaction(s=>auditEvent(s,scope,'qdrant.indexing.completed',items[0].document_id,`${items.length} chunks acknowledged`)); }
  catch(e) { await transaction(s=>auditEvent(s,scope,'qdrant.indexing.failed',items[0].document_id)); throw e; }
}
export function requireOmiScope(scope:Scope) { if(scope.tenant!==omiAssignment().tenant || scope.plant!==omiAssignment().plant) throw new IntegrationError('forbidden','Omi account is not assigned to this tenant and plant',403); }
