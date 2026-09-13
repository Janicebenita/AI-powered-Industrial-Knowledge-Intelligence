import { NextResponse } from 'next/server';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { identity,sameOrigin,rateLimit } from './auth';
import { env,IntegrationError } from './config';
import { hash,readState,sameScope,transaction,auditEvent } from './state';
import { chunksFor,indexEvidence } from './ingestion';
import { providers } from './factory';
import { errorResponse } from './api';
export async function integratedUpload(request:Request) {
  try {
    if(request.method!=='GET')sameOrigin(request);
    const scope=await identity(request,request.method==='GET'?'read':'write');rateLimit(scope.sub+':upload',15);
    const state=await readState();const visible=state.documents.filter(e=>sameScope(e,scope)&&e.permission_scope.some(r=>r==='plant'||r===scope.role));
    if(request.method==='GET') {
      const ids=[...new Set(visible.map(e=>e.document_id))];return NextResponse.json({provider:'qdrant',documents:ids.map(id=>{const docs=visible.filter(e=>e.document_id===id);return {filename:docs[0].filename,stored_filename:id,doc_type:docs[0].doc_type,uploaded_at:docs[0].timestamp,chunks:docs.length,entities:0};})});
    }
    if(request.method==='DELETE') {
      const id=new URL(request.url).searchParams.get('stored_filename');if(!id||!visible.some(e=>e.document_id===id))throw new IntegrationError('not_found','Document not found',404);
      await providers().vector.deleteDocument(id,scope);
      await transaction(s=>{s.documents=s.documents.filter(e=>!(e.document_id===id&&sameScope(e,scope)));auditEvent(s,scope,'qdrant.document.deleted',id,'Original file retained for recovery');});return NextResponse.json({status:'deleted',provider:'qdrant',stored_filename:id});
    }
    if(Number(request.headers.get('content-length')||0)>10*1024*1024+65536)throw new IntegrationError('invalid_input','Upload exceeds 10 MiB',413);
    const data=await request.formData();const file=data.get('file');
    if(!(file instanceof File)||!file.size)throw new IntegrationError('invalid_input','Nonempty file required',400);
    if(file.size>10*1024*1024)throw new IntegrationError('invalid_input','Upload exceeds 10 MiB',413);
    if(!/\.(pdf|txt|csv|md|log)$/i.test(file.name))throw new IntegrationError('invalid_input','Supported files: PDF, TXT, CSV, MD, LOG',415);
    const bytes=Buffer.from(await file.arrayBuffer());const id=hash(scope.tenant+':'+scope.plant+':'+hash(bytes.toString('base64')));
    let pages:Array<{text:string;num:number|null}>;
    if(/\.pdf$/i.test(file.name)) {
      try {const {PDFParse}=await import('pdf-parse');const parser=new PDFParse({data:new Uint8Array(bytes)});try {const result=await parser.getText();pages=result.pages.map(p=>({text:p.text,num:p.num}));}finally{await parser.destroy();}}catch{throw new IntegrationError('invalid_input','PDF extraction failed; provide searchable PDF or OCR text',422);}
    }else pages=[{text:bytes.toString('utf8'),num:null}];
    if(!pages.some(p=>p.text.trim()))throw new IntegrationError('invalid_input','No searchable text; OCR is required for scans',422);
    if(pages.reduce((n,p)=>n+p.text.length,0)>500000)throw new IntegrationError('invalid_input','Extracted text exceeds 500000 characters; split the file',413);
    const filename=file.name.replace(/[^\w.\-() ]/g,'_').slice(0,200);
    const chunks=pages.flatMap(p=>chunksFor(p.text,{document_id:id,filename,doc_type:'Industrial document',timestamp:new Date().toISOString(),page_number:p.num},scope));
    const dir=path.resolve(env('INTEGRATION_DATA_DIR')||'.integration-data','originals');await mkdir(dir,{recursive:true});await writeFile(path.join(dir,id),bytes,{mode:0o600});
    await indexEvidence(chunks,scope);
    return NextResponse.json({provider:'qdrant',document_id:id,stored_filename:id,filename,doc_type:'Industrial document',chunks:chunks.length,embeddings:chunks.length,entities:[],relationships:0,status:'processed',message:'Qdrant acknowledged indexing. Original evidence retained with exact page metadata where available.'});
  }catch(e){return errorResponse(e);}
}
