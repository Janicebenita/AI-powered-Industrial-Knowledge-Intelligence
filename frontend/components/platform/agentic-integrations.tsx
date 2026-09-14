"use client";
import { useSession, SessionControls, requestSignIn } from "@/components/session-provider";
import { useCallback,useEffect,useState } from 'react';
type Health={status:string;detail:string;last_success:string|null;vector_count?:number;collection?:string;workflow?:string;agent?:string};
type Report={storage?:{durable:boolean;detail:string};modes:{voice:string;vector:string;agent:string;fallback:boolean};providers:Record<string,Health>;configuration:string|null};
type RecordPreview={demonstration_data?:boolean;classification?:string;proposed_review_actions?:string[];id:string;conversation_id:string;transcript:string;asset_tag:string[];defect:string[];recommended_action:string[];status:string;indexing:string;timestamp:string|null;provider:string};
type Run={answer_id:string;provider:string;direct_answer:string;execution:{status:string;steps:Array<{name:string;status:string;provider:string;started_at?:string;ended_at?:string}>}};
async function call<T>(path:string,method='GET',body?:unknown):Promise<T> {
  const response=await fetch('/api/integrations/'+path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(response.status===401){requestSignIn();throw new Error("Sign in required");}
  const data=await response.json();if(!response.ok)throw new Error(data.detail||'Request failed');return data;
}
const button='rounded-lg border border-cyan-300/30 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-400/10 disabled:opacity-50';
const input='min-w-0 rounded-lg border border-white/20 bg-slate-950 p-2 text-white';
export function AgenticIntegrations({controls=false}:{controls?:boolean}) {
  const [report,setReport]=useState<Report|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const {user}=useSession();const signedIn=!!user;
  const [lastSync,setLastSync]=useState<string|null>(null);const [choices,setChoices]=useState<Array<{id:string}>>([]);
  const [id,setId]=useState('');const [preview,setPreview]=useState<RecordPreview|null>(null);const [records,setRecords]=useState<RecordPreview[]>([]);const [runs,setRuns]=useState<Run[]>([]);
  const refresh=useCallback(async()=>{try{setReport(await call<Report>('health'));}catch{setReport(null);setError('Integration health unavailable');}},[]);
  useEffect(()=>{void refresh();},[refresh]);
  useEffect(()=>{if(!signedIn||!controls)return;const timer=setInterval(()=>{void call<Run[]>('executions').then(setRuns).catch(()=>undefined);},3000);return()=>clearInterval(timer);},[signedIn,controls]);
  async function action(fn:()=>Promise<void>){setBusy(true);setError('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}}
  async function status(){const result=await call<{observations:RecordPreview[];last_sync:string|null}>('omi/status');setLastSync(result.last_sync);setRecords(result.observations);setRuns(await call<Run[]>('executions'));}
  return <section aria-label="Agentic Integrations" className="min-w-0 rounded-2xl border border-cyan-300/20 bg-slate-950/60 p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Agentic Integrations</h2><button className={button} onClick={()=>void action(refresh)} disabled={busy}>Check providers</button></div>
    {!report?<p role="status" className="mt-2 text-sm text-amber-200">Provider status unverified</p>:<>
      <p className="mt-2 break-words text-xs text-slate-300">Active modes: {report.modes.voice} / {report.modes.vector} / {report.modes.agent}. Demo fallback: {report.modes.fallback?'enabled':'disabled'}.</p>
      {report.storage&&!report.storage.durable&&<p role="status" className="mt-2 text-sm text-amber-200">{report.storage.detail}</p>}
      <div className="mt-3 grid gap-2 md:grid-cols-3">{Object.entries(report.providers).map(([name,h])=><div key={name} className="min-w-0 rounded-lg bg-white/5 p-3 text-sm"><strong>{name.toUpperCase()}: {h.status==='healthy'?'Connected (runtime checked)':h.status}</strong><p className="mt-1 break-words text-xs text-slate-400">{h.detail}</p><p className="mt-1 text-xs">Last success: {h.last_success||'Never verified'}</p>{h.collection&&<p className="break-all">Collection: {h.collection}</p>}{h.vector_count!==undefined&&<p>Stored vectors: {h.vector_count}</p>}{h.workflow&&<p>Workflow: {h.workflow}</p>}{h.agent&&<p>Direct agent: {h.agent}</p>}</div>)}</div>
      {report.configuration&&<p className="mt-2 text-xs text-amber-200">{report.configuration}</p>}
    </>}
    {controls&&<div className="mt-4 grid gap-3">
      <SessionControls />
      <form className="flex flex-wrap items-end gap-2" onSubmit={e=>{e.preventDefault();void action(async()=>setPreview(await call<RecordPreview>('omi/import','POST',{conversation_id:id})));}}>
        <label className="grid min-w-0 flex-1 gap-1 text-xs">Omi conversation ID<input className={input} value={id} onChange={e=>setId(e.target.value)} maxLength={200} required/></label>
        <button className={button} disabled={busy}>Import Omi Conversation</button><button className={button} type="button" disabled={busy} onClick={()=>void action(async()=>{const list=await call<{conversations:Array<{id:string}>}>('omi/conversations');setChoices(list.conversations);})}>Browse Omi conversations</button><button type="button" className={button} disabled={busy} onClick={()=>void action(status)}>Synchronization status</button>
      </form>
      <p className="text-xs text-slate-400">Last conversation import: {lastSync||'Not synchronized'}</p>
      {choices.length>0&&<div className="flex flex-wrap gap-2">{choices.map(c=><button key={c.id} className={button} onClick={()=>setId(c.id)}>{c.id}</button>)}</div>}
      {records.length>0&&<div className="flex flex-wrap gap-2">{records.map(r=><button className={button} key={r.id} onClick={()=>setPreview(r)}>{r.conversation_id} — {r.status}, {r.indexing}</button>)}</div>}
      {preview&&<article className="min-w-0 rounded-xl border border-white/10 p-3 text-sm"><h3>Omi transcript preview</h3>{preview.demonstration_data&&<p className="my-2 font-semibold text-amber-200">Simulated hackathon demonstration data — no operational action authorized.</p>}<p className="break-all text-xs">Source: Omi · {preview.conversation_id} · {preview.timestamp||'Timestamp unavailable'}</p><p className="my-3 max-h-64 overflow-auto whitespace-pre-wrap break-words">{preview.transcript}</p><p>Extracted assets: {preview.asset_tag.join(', ')||'None'}</p><p>Reported symptoms: {preview.defect.join(', ')||'None'}</p><p>Existing Omi action items (read only): {preview.recommended_action.join('; ')||'None supplied'}</p><p>Proposed engineering review passages: {preview.proposed_review_actions?.join('; ')||'None extracted'}</p><p>Extraction confidence: not calibrated; user review required.</p><p>Status: {preview.status} / {preview.indexing}</p><div className="mt-3 flex gap-2"><button className={button} disabled={busy||preview.status==='rejected'} onClick={()=>void action(async()=>{setPreview(await call<RecordPreview>(`omi/records/${preview.id}/approve`,'POST'));await status();})}>Approve observation / retry indexing</button><button className={button} disabled={busy||preview.status!=='pending'} onClick={()=>void action(async()=>{setPreview(await call<RecordPreview>(`omi/records/${preview.id}/reject`,'POST'));await status();})}>Reject</button></div></article>}
      {runs.length>0&&<details><summary>Workflow executions and human review</summary>{runs.slice(-10).reverse().map(run=><article key={run.answer_id} className="my-2 rounded-lg border border-white/10 p-3 text-xs"><p className="break-all">{run.answer_id} · {run.provider} · {run.execution.status}</p>{run.execution.steps.map((s,i)=><p key={i}>{s.name}: {s.status} ({s.provider}) · {s.started_at} → {s.ended_at||'in progress'}</p>)}<p>Operational authorization is separate from evidence review.</p><a className="text-cyan-200 underline" href={`/api/integrations/executions/${run.answer_id}/export`}>Export cited execution</a><button className={button} onClick={()=>void action(async()=>{await call(`executions/${run.answer_id}/review`,'POST',{decision:'reviewed'});})}>Record human review</button></article>)}</details>}
    </div>}
    {error&&<p role="alert" className="mt-3 text-sm text-amber-200">{error}</p>}
  </section>;
}
