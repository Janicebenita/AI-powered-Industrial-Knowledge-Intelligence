import { spawn } from 'node:child_process';
import path from 'node:path';
import { env,IntegrationError } from './config';
import type { EmbeddingProvider } from './contracts';

export function validateFastEmbed() {
  if(env('EMBEDDING_MODEL')!=='BAAI/bge-small-en-v1.5'||env('EMBEDDING_DIMENSION')!=='384')throw new IntegrationError('misconfigured','FastEmbed requires BAAI/bge-small-en-v1.5 and dimension 384');
}
// Serialize local inference to bound CPU/memory use on a single Render instance.
let active=false;
export class FastEmbedProvider implements EmbeddingProvider {
  get dimension(){validateFastEmbed();return 384;}
  async embed(texts:string[],purpose:'passage'|'query'='passage'):Promise<number[][]> {
    validateFastEmbed();if(!texts.length)return [];
    if(texts.length>32||texts.some(t=>typeof t!=='string'||t.length>12000)||JSON.stringify(texts).length>120000)throw new IntegrationError('invalid_input','FastEmbed batch too large',413);
    if(active)throw new IntegrationError('unavailable','Local embedding worker busy; retry later');
    active=true;
    try{return await new Promise<number[][]>((resolve,reject)=>{
      // Explicit allowlist: external API keys and the application session secret are not inherited.
      const childEnv:NodeJS.ProcessEnv={NODE_ENV:"production"};
      for(const name of ['PATH','Path','SystemRoot','WINDIR','TEMP','TMP','HOME'])if(process.env[name])childEnv[name]=process.env[name];
      Object.assign(childEnv,{FASTEMBED_CACHE_PATH:env('FASTEMBED_CACHE_PATH')||path.resolve('.integration-data/models'),HF_HUB_OFFLINE:'1',HF_HUB_DISABLE_TELEMETRY:'1',PYTHONIOENCODING:'utf-8'});
      const child=spawn(env('FASTEMBED_PYTHON')||(process.platform==='win32'?'python':'python3'),[path.resolve('scripts/fastembed-worker.py')],{shell:false,windowsHide:true,env:childEnv,stdio:['pipe','pipe','ignore']});
      let output='';let ended=false;
      const finish=(error?:IntegrationError,vectors?:number[][])=>{if(ended)return;ended=true;clearTimeout(timer);if(error)reject(error);else resolve(vectors!);};
      const timer=setTimeout(()=>{child.kill();finish(new IntegrationError('unavailable','Local embedding worker timed out'));},45000);
      child.on('error',()=>finish(new IntegrationError('misconfigured','FastEmbed Python runtime unavailable')));
      child.stdin.on('error',()=>finish(new IntegrationError('unavailable','Local embedding input failed')));
      child.stdout.on('data',chunk=>{output+=chunk.toString();if(output.length>2000000){child.kill();finish(new IntegrationError('invalid_response','Embedding output exceeds limit'));}});
      child.on('close',code=>{
        if(code!==0)return finish(new IntegrationError('unavailable','FastEmbed failed; initialize its local model cache and verify Python dependencies'));
        try{const vectors=JSON.parse(output).vectors;if(!Array.isArray(vectors)||vectors.length!==texts.length||vectors.some((v:unknown)=>!Array.isArray(v)||v.length!==384||v.some(n=>typeof n!=='number'||!Number.isFinite(n))))throw Error();finish(undefined,vectors);}
        catch{finish(new IntegrationError('invalid_response','FastEmbed output count, dimension or values invalid'));}
      });
      child.stdin.end(JSON.stringify({texts,purpose}));
    });}finally{active=false;}
  }
}
