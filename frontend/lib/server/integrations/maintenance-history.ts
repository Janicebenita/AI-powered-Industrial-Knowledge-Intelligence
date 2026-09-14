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
function invalid():never{throw new IntegrationError('insufficient_evidence','Maintenance source fields or citations could not be validated');}
// Strict CSV decoding retains exact source offsets and decoded field values.
function csv(text:string){
 const result:Array<{cells:string[];quote:string;start:number;end:number}>=[];
 let start=0,cells:string[]=[],field='',quoted=false,closed=false;
 const finish=(end:number)=>{cells.push(field);if(cells.some(c=>c.length))result.push({cells,quote:text.slice(start,end),start,end});cells=[];field='';closed=false;};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
  if(c==='"'){if(field||closed)invalid();quoted=true;}
  else if(c===','){cells.push(field);field='';closed=false;}
  else if(c==='\n'||c==='\r'){finish(i);if(c==='\r'&&text[i+1]==='\n')i++;start=i+1;}
  else{if(closed)invalid();field+=c;}
 }
 if(quoted)invalid();if(start<text.length)finish(text.length);
 return result;
}
export function maintenanceRecords(evidence:Evidence[],scope:Scope,asset:string):{records:HistoryRecord[];claims:Claim[]}{
 if(!scope.sub||!scope.tenant||!scope.plant||!scope.role)invalid();
 const records=new Map<string,HistoryRecord>(),ids=new Map<string,string>();
 for(const e of evidence){
  if(e.tenant!==scope.tenant||e.organization_id!==scope.tenant||e.plant!==scope.plant||e.plant_id!==scope.plant||!Array.isArray(e.permission_scope)||!e.permission_scope.some(r=>r==='plant'||r===scope.role))invalid();
  if(typeof e.id!=='string'||!e.id||!e.document_id||!e.filename||!e.section||!e.ingestion_version||typeof e.text!=='string'||hash(e.text)!==e.content_hash)invalid();
  if(ids.has(e.id)&&ids.get(e.id)!==e.content_hash)invalid();ids.set(e.id,e.content_hash);
  if(!e.filename.toLowerCase().endsWith('.csv')||!e.text.startsWith('work_order,'))continue;
  const rows=csv(e.text),header=rows.shift()?.cells;
  if(!header||new Set(header).size!==header.length||columns.some(c=>!header.includes(c)))invalid();
  for(const row of rows){
   if(row.cells.length!==header.length)invalid();
   const fields=Object.fromEntries(header.map((k,i)=>[k,row.cells[i]]));
   if(fields.asset_tag!==asset)continue;
   if(!Array.isArray(e.asset_tag)||!e.asset_tag.includes(asset)||!/^WO-\d+$/.test(fields.work_order)||columns.some(k=>!fields[k]?.trim()))invalid();
   if(!/^\d{4}-\d{2}-\d{2}$/.test(fields.date))invalid();
   const date=new Date(fields.date+'T00:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==fields.date)invalid();
   if(e.text.slice(row.start,row.end)!==row.quote||!row.quote)invalid();
   const source={citation_id:e.id,document_id:e.document_id,filename:e.filename,section:e.section,page_number:e.page_number,content_hash:e.content_hash,ingestion_version:e.ingestion_version,quote:row.quote,start:row.start,end:row.end,provenance:e.provenance};
   const prior=records.get(fields.work_order);
   if(prior){if(JSON.stringify(prior.fields)!==JSON.stringify(fields))invalid();if(!prior.citations.includes(e.id)){prior.citations.push(e.id);prior.sources.push(source);}}
   else records.set(fields.work_order,{fields,citations:[e.id],sources:[source]});
  }
 }
 if(!records.size)invalid();
 const sorted=[...records.values()].sort((a,b)=>a.fields.date.localeCompare(b.fields.date)||a.fields.work_order.localeCompare(b.fields.work_order));
 return {records:sorted,claims:sorted.map(r=>({kind:'fact',text:columns.map(k=>`${k}: ${r.fields[k]}`).join(' | '),citations:r.citations,quote:r.sources[0].quote}))};
}
