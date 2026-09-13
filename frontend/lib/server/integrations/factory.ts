import { OmiProvider } from './omi';
import { QdrantProvider } from './qdrant';
import { OpenAIEmbeddingProvider } from './embedding';
import { FastEmbedProvider } from './fastembed';
import { LyzrProvider } from './lyzr';
import { env,modes,validateConfig,IntegrationError,lyzrAgentMode } from './config';
export const providers = () => ({conversation:new OmiProvider(),vector:new QdrantProvider(env('EMBEDDING_PROVIDER')==='fastembed'?new FastEmbedProvider():new OpenAIEmbeddingProvider()),agent:new LyzrProvider(),verifier:new LyzrProvider('LYZR_VERIFIER_AGENT_ID')});
export async function healthReport() {
  const m=modes(); const p=providers();
  const [omi,qdrant,lyzr,lyzr_verifier]=await Promise.all([m.voice==='disabled'?{provider:'omi',status:'disabled',checked_at:new Date().toISOString(),last_success:null,detail:'Voice capture disabled'}:p.conversation.health(),p.vector.health(),p.agent.health(),lyzrAgentMode()?p.verifier.health():Promise.resolve({provider:'lyzr_verifier',status:'disabled',checked_at:new Date().toISOString(),last_success:null,detail:'Separate verifier is used in direct-agent mode'})]);
  let configuration:string|null=null; try{validateConfig();}catch(e){configuration=e instanceof IntegrationError?e.message:'Configuration invalid';}
  const mandatory=[...(m.voice==='omi'?[omi]:[]),...(m.vector==='qdrant'?[qdrant]:[]),...(m.agent==='lyzr'?[lyzr,...(lyzrAgentMode()?[lyzr_verifier]:[])]:[])];
  const ready=!configuration && (mandatory.every(h=>h.status==='healthy') || m.fallback);
  return {status:ready?'healthy':'unavailable',ready,configuration,modes:m,providers:{omi,qdrant,lyzr,lyzr_verifier},checked_at:new Date().toISOString()};
}
