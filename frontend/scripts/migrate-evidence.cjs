// Dry run by default. Never creates or deletes collections or legacy evidence.
require('./register-typescript.cjs');
const fs=require('node:fs/promises');const path=require('node:path');
const {chunksFor,indexEvidence}=require('../lib/server/integrations/ingestion.ts');
const {hash,readState,transaction,auditEvent}=require('../lib/server/integrations/state.ts');
async function main(){
  const filename=process.argv[2];if(!filename)throw Error('Usage: node scripts/migrate-evidence.cjs INPUT.json [--apply]');
  const scope={sub:'migration-cli',role:'plant_manager',tenant:process.env.MIGRATION_TENANT,plant:process.env.MIGRATION_PLANT};
  if(!scope.tenant||!scope.plant)throw Error('MIGRATION_TENANT and MIGRATION_PLANT required; never infer tenant ownership');
  const docs=JSON.parse(await fs.readFile(path.resolve(filename),'utf8'));if(!Array.isArray(docs))throw Error('Input must be an array of legacy documents');
  const state=await readState();let pending=0;let resumed=0;
  for(const doc of docs){
    if(typeof doc.text!=='string'||!doc.filename)throw Error('Each document requires filename and text');
    if((doc.tenant&&doc.tenant!==scope.tenant)||(doc.plant&&doc.plant!==scope.plant))throw Error('Source ownership differs from migration scope');
    const permissions=doc.permission_scope||process.env.MIGRATION_PERMISSION_SCOPE?.split(',');
    const allowed=['plant','plant_manager','reliability_engineer','maintenance_engineer','operator','safety_officer','quality_manager','compliance_auditor','executive'];
    if(!Array.isArray(permissions)||!permissions.length||permissions.some(p=>!allowed.includes(p)))throw Error('Explicit valid source permissions or MIGRATION_PERMISSION_SCOPE required');
    // Legacy page numbers are synthetic. Preserve original filename and offsets, no invented page.
    const id=hash([scope.tenant,scope.plant,doc.stored_filename||doc.filename,doc.text].join(':'));
    const checkpoint=['payload-v2',process.env.QDRANT_COLLECTION,process.env.EMBEDDING_MODEL,process.env.EMBEDDING_DIMENSION,id].join(':');
    if(state.migrations[checkpoint]){resumed++;continue;}
    const items=chunksFor(doc.text,{document_id:id,filename:doc.filename,doc_type:doc.doc_type||'Legacy evidence',timestamp:doc.uploaded_at||null},scope);pending+=items.length;
    for(const item of items)item.permission_scope=permissions;
    if(process.argv.includes('--apply')){await indexEvidence(items,scope);await transaction(s=>{s.migrations[checkpoint]=new Date().toISOString();auditEvent(s,scope,'migration.document.completed',id,`${items.length} chunks acknowledged`);});}
  }
  console.log(JSON.stringify({mode:process.argv.includes('--apply')?'applied':'dry-run',pending_chunks:pending,previously_completed_documents:resumed,legacy_modified:false}));
}
main().catch(()=>{console.error('Migration failed; inspect configuration and retained checkpoint. No legacy data was changed.');process.exitCode=1;});
