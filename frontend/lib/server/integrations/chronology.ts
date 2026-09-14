import type {Claim,Evidence} from './contracts';

// Parse only complete CSV records. A truncated final quoted row is not evidence.
function rows(text:string){
 const result:string[][]=[];let row:string[]=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(field.trim());field='';}
  else if(c==='\n'&&!quoted){row.push(field.trim());result.push(row);row=[];field='';}
  else field+=c;
 }
 if(!quoted&&(field||row.length)){row.push(field.trim());result.push(row);}
 return result;
}
export function sourceRecordDate(claim:Claim,evidence:Evidence[]){
 const matches:Array<{value:string;record_id:string;citation_id:string}>=[];
 for(const passage of evidence.filter(e=>claim.citations.includes(e.id))){
  const data=rows(passage.text),header=data.shift()?.map(x=>x.toLowerCase());
  if(!header)continue;const idColumn=header.indexOf('work_order'),dateColumn=header.indexOf('date');
  if(idColumn<0||dateColumn<0||header.filter(h=>h==='work_order').length!==1||header.filter(h=>h==='date').length!==1)continue;
  for(const row of data){
   if(row.length!==header.length)continue;
   const id=row[idColumn],date=row[dateColumn];
   if(!/^[\w-]{2,80}$/.test(id)||!/^\d{4}-\d{2}-\d{2}$/.test(date))continue;
   const parsed=new Date(date+'T00:00:00Z');if(!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)continue;
   if(new RegExp('(?<![\\w-])'+id+'(?![\\w-])','i').test(claim.text))matches.push({value:date,record_id:id,citation_id:passage.id});
  }
 }
 // Conflicting source dates must not be silently resolved.
 return matches.length&&new Set(matches.map(m=>m.value)).size===1?matches[0]:undefined;
}
