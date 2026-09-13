import { baseUrl,required,IntegrationError } from './config';
import { requestJson } from './http';
import type { EmbeddingProvider } from './contracts';
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  get dimension() { const n=Number(required('EMBEDDING_DIMENSION')); if(!Number.isInteger(n)||n<1||n>65536) throw new IntegrationError('misconfigured','Invalid EMBEDDING_DIMENSION'); return n; }
  async embed(texts:string[]) {
    if(!texts.length) return [];
    const result=await requestJson<{data:Array<{index:number;embedding:number[]}>}>('Embeddings',baseUrl('EMBEDDING_API_BASE_URL','https://api.openai.com/v1')+'/embeddings',{method:'POST',headers:{Authorization:`Bearer ${required('EMBEDDING_API_KEY')}`,'Content-Type':'application/json'},body:JSON.stringify({input:texts,model:required('EMBEDDING_MODEL'),dimensions:this.dimension})});
    if(!Array.isArray(result.data) || result.data.length!==texts.length) throw new IntegrationError('invalid_response','Embedding count mismatch');
    const vectors=result.data.sort((a,b)=>a.index-b.index);
    if(vectors.some((v,i)=>v.index!==i || !Array.isArray(v.embedding) || v.embedding.length!==this.dimension || v.embedding.some(n=>!Number.isFinite(n)))) throw new IntegrationError('invalid_response','Embedding dimension or values invalid');
    return vectors.map(v=>v.embedding);
  }
}
