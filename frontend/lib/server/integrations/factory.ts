import { OmiProvider } from './omi';
import { QdrantProvider } from './qdrant';
import { OpenAIEmbeddingProvider } from './embedding';
import { FastEmbedProvider } from './fastembed';
import { LyzrProvider } from './lyzr';
import { env,modes,validateConfig,IntegrationError } from './config';
export const providers = () => ({conversation:new OmiProvider(),vector:new QdrantProvider(env('EMBEDDING_PROVIDER')==='fastembed'?new FastEmbedProvider():new OpenAIEmbeddingProvider()),agent:new LyzrProvider()});
export async function healthReport() {
  const m=modes(); const p=providers();
  const [omi,qdrant,lyzr]=await Promise.all([m.voice==='disabled'?{provider:'omi',status:'disabled',checked_at:new Date().toISOString(),last_success:null,detail:'Voice capture disabled'}:p.conversation.health(),p.vector.health(),p.agent.health()]);
  let configuration:string|null=null; try{validateConfig();}catch(e){configuration=e instanceof IntegrationError?e.message:'Configuration invalid';}
  const mandatory=[...(m.voice==='omi'?[omi]:[]),...(m.vector==='qdrant'?[qdrant]:[]),...(m.agent==='lyzr'?[lyzr]:[])];
  const ready=!configuration && (mandatory.every(h=>h.status==='healthy') || m.fallback);
  return {status:ready?'healthy':'unavailable',ready,configuration,modes:m,providers:{omi,qdrant,lyzr},checked_at:new Date().toISOString()};
}
