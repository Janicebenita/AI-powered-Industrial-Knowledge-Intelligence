import {readFile} from 'node:fs/promises';
import {env} from './config';
import {persistentEmbed,embeddingMetrics} from './fastembed-persistent';
const processState=globalThis as typeof globalThis & {industrialProbeStarted?:boolean;industrialReadyAt?:number};
async function cgroup(name:string){try{return (await readFile('/sys/fs/cgroup/'+name,'utf8')).trim();}catch{return null;}}
export async function freeStagingRuntime(){
 if(env('STAGING_DISPOSABLE')!=='true')return null;
 if(env('FASTEMBED_PERSISTENT')==='true'&&!processState.industrialProbeStarted){
  processState.industrialProbeStarted=true;
  void persistentEmbed(['Embedding readiness check'],'query').catch(()=>undefined);
 }
 const embedding=embeddingMetrics();const ready=embedding.loaded&&embedding.requests>0;
 if(ready)processState.industrialReadyAt??=process.uptime();
 const [current,peak,events]=await Promise.all([cgroup('memory.current'),cgroup('memory.peak'),cgroup('memory.events')]);
 return {embedding_ready:ready,embedding,startup_to_embedding_ready_seconds:processState.industrialReadyAt??null,process_uptime_seconds:process.uptime(),node_rss_bytes:process.memoryUsage().rss,cgroup_memory_current_bytes:current?Number(current):null,cgroup_memory_peak_bytes:peak?Number(peak):null,cgroup_memory_events:events,process_restart_count:null,process_restart_note:'Restart count requires Render event history; counters reset with the process.'};
}
