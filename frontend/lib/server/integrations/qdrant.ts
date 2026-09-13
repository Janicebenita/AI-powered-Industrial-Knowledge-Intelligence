import { baseUrl,required,IntegrationError,env } from './config';
import { requestJson } from './http';
import { hash } from './state';
import { checkHealth } from './provider-health';
import type { VectorStoreProvider, EmbeddingProvider, Evidence, Scope } from './contracts';
export function scopeFilter(scope:Scope,asset?:string,document?:string) {
  if(!scope.tenant || !scope.plant || !scope.role) throw new IntegrationError('forbidden','Retrieval scope required',403);
  return {must:[{key:'tenant',match:{value:scope.tenant}},{key:'plant',match:{value:scope.plant}},{key:'organization_id',match:{value:scope.tenant}},{key:'plant_id',match:{value:scope.plant}},{key:'permission_scope',match:{any:['plant',scope.role]}},...(asset?[{key:'asset_tag',match:{value:asset.replace('-','').toUpperCase()}}]:[]),...(document?[{key:'document_id',match:{value:document}}]:[])]};
}
export function pointId(id:string) { const h=hash(id); return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`; }
export class QdrantProvider implements VectorStoreProvider {
  constructor(private embedding:EmbeddingProvider) {}
  private get collection() { const c=required('QDRANT_COLLECTION'); if(!/^[a-zA-Z0-9_-]+_v\d+$/.test(c)) throw new IntegrationError('misconfigured','QDRANT_COLLECTION must be versioned (_v1, _v2, ...)'); return c; }
  private call<T>(suffix:string,method='GET',body?:unknown) { return requestJson<T>('Qdrant',baseUrl('QDRANT_URL')+'/collections/'+this.collection+suffix,{method,headers:{'api-key':required('QDRANT_API_KEY'),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})}); }
  async health() { return checkHealth('qdrant',async()=>{
    const r=await this.call<{result:{status:string;points_count:number;config:{params:{vectors:{size:number;distance:string}}}}}>('');
    const config=r.result?.config?.params?.vectors;
    if(config?.size!==this.embedding.dimension || config?.distance!=='Cosine') throw new IntegrationError('misconfigured','Qdrant collection embedding schema mismatch');
    if(!Number.isInteger(r.result.points_count) || r.result.points_count<0) throw new IntegrationError('invalid_response','Qdrant count malformed');
    return {status:r.result.status==='green'?'healthy':'degraded',collection:this.collection,vector_count:r.result.points_count,detail:'Authenticated collection status and dimensions checked'};
  }); }
  async initialize() {
    if(env('STAGING_READ_ONLY')==='true')throw new IntegrationError('forbidden','Qdrant writes disabled in disposable staging',403);
    const exists=await this.call<{result:{exists:boolean}}>('/exists');
    if(exists.result?.exists!==true) await this.call('', 'PUT',{vectors:{size:this.embedding.dimension,distance:'Cosine'}});
    const health=await this.health(); if(health.status!=='healthy') throw new IntegrationError('misconfigured',health.detail);
    for(const field of ['tenant','plant','organization_id','plant_id','permission_scope','document_id','asset_tag','content_hash']) await this.call('/index?wait=true','PUT',{field_name:field,field_schema:'keyword'});
  }
  async upsert(items:Evidence[]) {
    if(env('STAGING_READ_ONLY')==='true')throw new IntegrationError('forbidden','Qdrant writes disabled in disposable staging',403);
    for(let i=0;i<items.length;i+=32) {
      const batch=items.slice(i,i+32); const vectors=await this.embedding.embed(batch.map(e=>e.text));
      if(vectors.length!==batch.length||vectors.some(v=>v.length!==this.embedding.dimension||v.some(n=>typeof n!=='number'||!Number.isFinite(n))))throw new IntegrationError('invalid_response','Vector dimensions or values invalid');
      const response=await this.call<{result:{status:string}}>('/points?wait=true','PUT',{points:batch.map((e,j)=>({id:pointId(e.id),vector:vectors[j],payload:e}))});
      if(response.result?.status!=='completed') throw new IntegrationError('unavailable','Qdrant did not confirm completed indexing');
    }
  }
  async search(question:string,scope:Scope,asset?:string) {
    const retrievalQuestion=/overdue.*inspection|inspection.*overdue/i.test(question)?question+' Asset register inspection due status and inspection checklist missing evidence.':question;
    const vector=(await this.embedding.embed([retrievalQuestion],'query'))[0];
    const result=await this.call<{result:{points:Array<{payload:Evidence;score:number}>}}>('/points/query','POST',{query:vector,filter:scopeFilter(scope,asset),limit:8,with_payload:true,with_vector:false,score_threshold:Number(env('QDRANT_SCORE_THRESHOLD')||0.35)});
    if(!Array.isArray(result.result?.points)) throw new IntegrationError('invalid_response','Qdrant search response malformed');
    return result.result.points.map(p=>{
      const e=p.payload;
      if(!e || e.organization_id!==scope.tenant || e.plant_id!==scope.plant || e.tenant!==scope.tenant || e.plant!==scope.plant || !Array.isArray(e.permission_scope) || !e.permission_scope.some(v=>v==='plant'||v===scope.role) || typeof e.text!=='string' || hash(e.text)!==e.content_hash || !e.id || !Number.isFinite(p.score)) throw new IntegrationError('invalid_response','Qdrant returned invalid or out-of-scope evidence');
      return {...e,score:p.score};
    });
  }
  async deleteDocument(id:string,scope:Scope) {
    if(env('STAGING_READ_ONLY')==='true')throw new IntegrationError('forbidden','Qdrant writes disabled in disposable staging',403);
    const result=await this.call<{result:{status:string}}>('/points/delete?wait=true','POST',{filter:scopeFilter(scope,undefined,id)});
    if(result.result?.status!=='completed') throw new IntegrationError('unavailable','Qdrant deletion not confirmed');
  }
}
