import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import path from 'node:path';
import {env,IntegrationError} from './config';
type WorkerState={child?:ChildProcessWithoutNullStreams;pending?:{resolve:(v:number[][])=>void;reject:(e:Error)=>void;count:number;timer:ReturnType<typeof setTimeout>};buffer:string;model_load_ms:number|null;requests:number;starts:number;failures:number;last_ms:number|null;first_ms:number|null;started:number};
const runtime=globalThis as typeof globalThis & {industrialEmbeddingWorker?:WorkerState};
const state=()=>runtime.industrialEmbeddingWorker??=( {buffer:'',model_load_ms:null,requests:0,starts:0,failures:0,last_ms:null,first_ms:null,started:0} );
export function embeddingMetrics(){const s=state();return {loaded:!!s.child&&s.model_load_ms!==null,model_load_ms:s.model_load_ms,worker_starts:s.starts,worker_failures:s.failures,requests:s.requests,first_embedding_ms:s.first_ms,last_embedding_ms:s.last_ms};}
export function stopEmbeddingWorker(){state().child?.kill();}
export async function persistentEmbed(texts:string[],purpose:string):Promise<number[][]>{
 const s=state();if(s.pending)throw new IntegrationError('unavailable','Local embedding worker busy; retry later');
 return new Promise((resolve,reject)=>{
  s.started=Date.now();
  const fail=()=>{s.failures++;const pending=s.pending;s.pending=undefined;if(pending){clearTimeout(pending.timer);pending.reject(new IntegrationError('unavailable','Persistent embedding worker failed or timed out'));}};
  s.pending={resolve,reject,count:texts.length,timer:setTimeout(()=>{s.child?.kill();fail();},120000)};
  if(!s.child){
   const childEnv:NodeJS.ProcessEnv={NODE_ENV:'production',HF_HUB_OFFLINE:'1',HF_HUB_DISABLE_TELEMETRY:'1',PYTHONIOENCODING:'utf-8',FASTEMBED_CACHE_PATH:env('FASTEMBED_CACHE_PATH')||'/tmp/industrial-brain-models'};
   for(const n of ['PATH','Path','SystemRoot','WINDIR','TEMP','TMP','HOME'])if(process.env[n])childEnv[n]=process.env[n];
   const child=spawn(env('FASTEMBED_PYTHON')||'python3',[path.resolve('scripts/fastembed-worker.py'),'--serve'],{env:childEnv,shell:false,windowsHide:true,stdio:'pipe'});
   s.child=child;s.buffer='';s.model_load_ms=null;s.starts++;
   child.stderr.on('data',()=>undefined);
   child.on('error',fail);child.stdin.on('error',fail);
   child.on('close',()=>{if(s.child===child){s.child=undefined;s.model_load_ms=null;fail();}});
   child.stdout.on('data',chunk=>{
    s.buffer+=chunk.toString();if(s.buffer.length>2000000){child.kill();fail();return;}
    let end:number;while((end=s.buffer.indexOf('\n'))>=0){const line=s.buffer.slice(0,end);s.buffer=s.buffer.slice(end+1);
     try{const result=JSON.parse(line);if(result.ready===true&&Number.isFinite(result.model_load_ms)){s.model_load_ms=result.model_load_ms;continue;}
      const p=s.pending;if(!p)throw Error();const v=result.vectors;
      if(!Array.isArray(v)||v.length!==p.count||v.some((row:unknown)=>!Array.isArray(row)||row.length!==384||row.some(n=>typeof n!=='number'||!Number.isFinite(n))))throw Error();
      clearTimeout(p.timer);s.pending=undefined;s.requests++;s.last_ms=Date.now()-s.started;s.first_ms??=s.last_ms;p.resolve(v);
     }catch{child.kill();fail();}
    }
   });
  }
  s.child.stdin.write(JSON.stringify({texts,purpose})+'\n');
 });
}

