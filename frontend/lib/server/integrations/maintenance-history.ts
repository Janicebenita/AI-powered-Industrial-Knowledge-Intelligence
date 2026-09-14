import type {Claim,Evidence,Scope} from './contracts';
import {hash} from './state';
import {IntegrationError} from './config';

export const isMaintenanceHistory=(question:string)=>/maintenance.*history|history.*maintenance/i.test(question)&&! /\b(?:why|rca|causes?|hypotheses|interpret)\b/i.test(question);
export function historyAsset(question:string){
 const assets=[...new Set((question.toUpperCase().match(/\b[A-Z]{1,4}-?\d{2,6}\b/g)||[]).map(a=>a.replace('-','')))];
 if(assets.length!==1)throw new IntegrationError('invalid_input','Maintenance history requires exactly one asset tag',400);
 return assets[0];
}
const columns=['work_order','asset_tag','date','role','maintenance_action','failure_mode','parts_used','status','notes'] as const;
export type HistoryRecord={fields:Record<string,string>;citations:string[];sources:Array<{citation_id:string;document_id:string;filename:string;section:string;page_number:number|null;content_hash:string;ingestion_version:string;quote:string;start:number;end:number;provenance:Evidence['provenance']}>};
export type ExtractionDecision={passage:number;citation_id?:string;row?:number;decision:'accepted'|'ignored'|'rejected'|'duplicate';reason:string};
export class MaintenanceExtractionError extends IntegrationError{
 constructor(public decisions:ExtractionDecision[]){super('insufficient_evidence','No valid scoped maintenance records remain');}
}
// Preserve complete CSV records and exact offsets even when another row is bad.
function csv(text:string){
 const result:Array<{cells:string[];quote:string;start:number;end:number;error?:string}>=[];
 let start=0,cells:string[]=[],field='',quoted=false,closed=false,error:string|undefined;
 const finish=(end:number)=>{cells.push(field);if(cells.some(c=>c.length))result.push({cells,quote:text.slice(start,end),start,end,error});cells=[];field='';closed=false;error=undefined;};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
  if(c==='"'){if(field||closed){error='malformed_csv_quote';field+=c;}else quoted=true;}
  else if(c===','){cells.push(field);field='';closed=false;}
  else if(c==='\n'||c==='\r'){finish(i);if(c==='\r'&&text[i+1]==='\n')i++;start=i+1;}
  else{if(closed)error='malformed_csv_quote';field+=c;}
 }
 if(quoted)error='truncated_csv_row';if(start<text.length)finish(text.length);
 return result;
}
export function maintenanceRecords(evidence:Evidence[],scope:Scope,asset:string):{records:HistoryRecord[];claims:Claim[];decisions:ExtractionDecision[]}{
 const decisions:ExtractionDecision[]=[];
 if(!scope.sub||!scope.tenant||!scope.plant||!scope.role)throw new MaintenanceExtractionError([{passage:-1,decision:'rejected',reason:'missing_authorized_scope'}]);
 const records=new Map<string,HistoryRecord>(),conflicts=new Set<string>();
 const idHashes=new Map<string,Set<string>>();
 for(const e of evidence){if(typeof e.id==='string'){const hashes=idHashes.get(e.id)||new Set<string>();hashes.add(e.content_hash);idHashes.set(e.id,hashes);}}
 for(const [passage,e] of evidence.entries()){
  const decide=(decision:ExtractionDecision['decision'],reason:string,row?:number)=>decisions.push({passage,...(typeof e.id==='string'?{citation_id:e.id}:{}),row,decision,reason});
  // Classify before requiring maintenance metadata on unrelated evidence.
  const candidate=typeof e.filename==='string'&&e.filename.toLowerCase().endsWith('.csv')&&(typeof e.text==='string'&&e.text.startsWith('work_order,')||/maintenance|work.?order/i.test(e.filename));
  if(!candidate){decide('ignored','unrelated_passage');continue;}
  if(e.tenant!==scope.tenant||e.organization_id!==scope.tenant||e.plant!==scope.plant||e.plant_id!==scope.plant||!Array.isArray(e.permission_scope)||!e.permission_scope.some(r=>r==='plant'||r===scope.role)){decide('rejected','unauthorized_scope');continue;}
  if(typeof e.id!=='string'||!e.id){decide('rejected','missing_citation');continue;}
  if(!e.document_id||!e.filename||!e.section||!e.ingestion_version){decide('rejected','missing_source_provenance');continue;}
  if(typeof e.text!=='string'||hash(e.text)!==e.content_hash){decide('rejected','content_hash_mismatch');continue;}
  if((idHashes.get(e.id)?.size||0)>1){decide('rejected','conflicting_citation_payload');continue;}
  const rows=csv(e.text),first=rows.shift(),header=first?.cells;
  if(first?.error||!header||new Set(header).size!==header.length||columns.some(c=>!header.includes(c))){decide('rejected','invalid_csv_header');continue;}
  for(const [index,row] of rows.entries()){
   const rowNumber=index+2;
   if(row.error){decide('rejected',row.error,rowNumber);continue;}
   if(row.cells.length!==header.length){decide('rejected','csv_field_count_mismatch',rowNumber);continue;}
   const fields=Object.fromEntries(header.map((k,i)=>[k,row.cells[i]]));
   if(fields.asset_tag!==asset){decide('ignored','different_asset',rowNumber);continue;}
   if(!Array.isArray(e.asset_tag)||!e.asset_tag.includes(asset)){decide('rejected','asset_metadata_mismatch',rowNumber);continue;}
   if(!/^WO-\d+$/.test(fields.work_order)){decide('rejected','invalid_work_order_id',rowNumber);continue;}
   if(columns.some(k=>!fields[k]?.trim())){decide('rejected','missing_source_field',rowNumber);continue;}
   const date=new Date(fields.date+'T00:00:00Z');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(fields.date)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==fields.date){decide('rejected','invalid_record_date',rowNumber);continue;}
   if(!row.quote||e.text.slice(row.start,row.end)!==row.quote){decide('rejected','source_excerpt_mismatch',rowNumber);continue;}
   const source={citation_id:e.id,document_id:e.document_id,filename:e.filename,section:e.section,page_number:e.page_number,content_hash:e.content_hash,ingestion_version:e.ingestion_version,quote:row.quote,start:row.start,end:row.end,provenance:e.provenance};
   if(conflicts.has(fields.work_order)){decide('rejected','conflicting_record',rowNumber);continue;}
   const prior=records.get(fields.work_order);
   if(prior&&columns.some(k=>prior.fields[k]!==fields[k])){records.delete(fields.work_order);conflicts.add(fields.work_order);decide('rejected','conflicting_record',rowNumber);continue;}
   if(prior){if(!prior.citations.includes(e.id)){prior.citations.push(e.id);prior.sources.push(source);}decide('duplicate','identical_record',rowNumber);}
   else{records.set(fields.work_order,{fields,citations:[e.id],sources:[source]});decide('accepted','exact_scoped_record',rowNumber);}
  }
 }
 const sorted=[...records.values()].sort((a,b)=>a.fields.date.localeCompare(b.fields.date)||a.fields.work_order.localeCompare(b.fields.work_order));
 for(const record of sorted){record.citations.sort();record.sources.sort((a,b)=>a.citation_id.localeCompare(b.citation_id)||a.start-b.start);}
 if(!sorted.length)throw new MaintenanceExtractionError(decisions);
 return {records:sorted,decisions,claims:sorted.map(r=>({kind:'fact',text:columns.map(k=>`${k}: ${r.fields[k]}`).join(' | '),citations:r.citations,quote:r.sources[0].quote}))};
}
