import { baseUrl, required, IntegrationError } from './config';
import { requestJson } from './http';
import { hash } from './state';
import type { ConversationProvider, Observation, Scope } from './contracts';
import { checkHealth } from './provider-health';
export class OmiProvider implements ConversationProvider {
  private call<T>(suffix:string) { return requestJson<T>('Omi',baseUrl('OMI_API_BASE_URL','https://api.omi.me')+'/v1/dev/user/conversations'+suffix,{headers:{Authorization:`Bearer ${required('OMI_API_KEY')}`}}); }
  async list(offset=0) { const result=await this.call<unknown[]>(`?limit=25&offset=${offset}&include_transcript=true`); if(!Array.isArray(result)) throw new IntegrationError('invalid_response','Omi conversation list malformed'); return result; }
  async get(id:string) { return this.call<unknown>('/'+encodeURIComponent(id)+'?include_transcript=true'); }
  async health() { return checkHealth('omi',async()=>{await this.list(); return {detail:'Authenticated Omi conversation read succeeded'};}); }
}
export function normalizeConversation(raw:unknown,scope:Scope):Observation {
  if(!raw || typeof raw!=='object') throw new IntegrationError('invalid_response','Omi conversation malformed');
  const c=raw as Record<string,unknown>;
  if(typeof c.id!=='string' || !c.id || c.id.length>200 || !Array.isArray(c.transcript_segments)) throw new IntegrationError('invalid_response','Omi conversation requires ID and transcript_segments');
  const segments=c.transcript_segments as Array<Record<string,unknown>>;
  if(segments.some(s=>typeof s.text!=='string')) throw new IntegrationError('invalid_response','Omi transcript segment malformed');
  const transcript=segments.map(s=>s.text).join('\n');
  if(!transcript.trim() || transcript.length>120000) throw new IntegrationError('invalid_response','Omi transcript empty or exceeds 120000 characters');
  const structured=c.structured && typeof c.structured==='object' ? c.structured as Record<string,unknown> : {};
  const actions=Array.isArray(structured.action_items) ? structured.action_items as Array<Record<string,unknown>> : [];
  // Normalize spoken digit sequences without altering the source transcript.
  const digits:Record<string,string>={zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9'};
  const assetText=transcript.replace(/\bpump\s+((?:(?:zero|one|two|three|four|five|six|seven|eight|nine)\s+){2,5}(?:zero|one|two|three|four|five|six|seven|eight|nine))\b/gi,(_,words:string)=>'P'+words.toLowerCase().split(/\s+/).map(word=>digits[word]).join('')).replace(/\bpump\s+(\d{3,6})\b/gi,'P$1');
  const content_hash=hash(transcript);
  const demonstration= /\b(simulated|simulation|demonstration data|hackathon demonstration)\b/i.test(transcript);
  const proposed_review_actions=transcript.split(/(?<=[.!?])\s+|\n+/).filter(sentence=>/\b(review|inspect|verify)\b/i.test(sentence)&&!/\bno .*authoriz/i.test(sentence));
  const previewMetadata={demonstration_data:demonstration,classification:demonstration?'simulated_hackathon_demonstration':'unclassified_pending_review',operational_authorization:false as const,proposed_review_actions,extraction_method:'deterministic source matching; unconfirmed and pending human review',timestamp_source:typeof c.started_at==='string'?'started_at':typeof c.created_at==='string'?'created_at':null};
  return {id:hash([scope.tenant,scope.plant,c.id,content_hash].join(':')), source_id:c.id, conversation_id:c.id, provider:'omi', tenant:scope.tenant, plant:scope.plant, organization_id:scope.tenant, plant_id:scope.plant, imported_by:scope.sub, imported_at:new Date().toISOString(), timestamp:typeof c.started_at==='string'?c.started_at:typeof c.created_at==='string'?c.created_at:null, transcript, speakers:[...new Set(segments.map(s=>s.speaker_name ?? s.speaker ?? (typeof s.speaker_id==='number'?String(s.speaker_id):null)).filter((v):v is string=>typeof v==='string'))], asset_tag:[...new Set((assetText.match(/\b(?:P|C|HX|V|B|EP)-?\d{3,6}\b/gi)||[]).map(v=>v.replace('-','').toUpperCase()))], observation:transcript, defect:(transcript.match(/abnormal vibration|seal leakage|seal failure|cavitation|corrosion|overheating/gi)||[]), recommended_action:actions.map(a=>a.description).filter((v):v is string=>typeof v==='string'), responsible_role:null, due_date:actions.length===1 && typeof actions[0].due_at==='string'?actions[0].due_at:null, confidence:null,content_hash,provenance:{conversation_id:c.id,segment_indexes:segments.map((_,i)=>i),source_provider:'omi',segments:segments.map((s,index)=>({index,...(typeof s.id==='string'?{id:s.id}:{}),...(typeof s.start==='number'&&Number.isFinite(s.start)?{start:s.start}:{}),...(typeof s.end==='number'&&Number.isFinite(s.end)?{end:s.end}:{})}))},...previewMetadata,status:'pending',indexing:'not_indexed'};
}
