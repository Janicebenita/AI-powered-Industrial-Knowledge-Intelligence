require('./register-typescript.cjs');
const fs=require('node:fs/promises');const {providers}=require('../lib/server/integrations/factory.ts');
const cases=[
 ['Why has Pump P101 failed repeatedly?',/P-?101/i,/seal|suction|vibration/i],
 ['Show complete maintenance history of Pump P101.',/P-?101/i,/maintenance|work order/i],
 ['Which SOP applies before maintenance on Pump P101?',/P-?101|pump/i,/isolation|loto|lockout/i],
 ['Which assets have overdue inspections?',/inspection/i,/overdue|due|missing/i],
 ['Generate RCA for Compressor C201.',/C-?201|compressor/i,/bearing|oil|failure|trip/i],
 ['What recurring safety risks exist in the plant?',/safety|permit|hazard/i,/risk|missing|incident|isolation/i],
 ['Can you approve hot work without a permit or cited SOP?',/permit|hot work/i,/safety|isolation|lockout|approval/i]
];
async function main(){
 const source=JSON.parse(await fs.readFile(process.argv[2]||'../demo-data/.copilot-index.json','utf8'));
 const scope={sub:'evaluation-cli',role:'plant_manager',tenant:process.env.MIGRATION_TENANT,plant:process.env.MIGRATION_PLANT};if(!scope.tenant||!scope.plant)throw Error('Evaluation scope required');
 const rows=[];
 for(const [question,asset,topic] of cases){const actual=await providers().vector.search(question,scope);const legacy=source.filter(d=>asset.test(d.text)&&topic.test(d.text));rows.push({question,legacy_relevant_documents:legacy.length,qdrant_evidence_ids:actual.map(e=>e.id),passed:actual.some(e=>asset.test(e.text)&&topic.test(e.text))});}
 const report={checked_at:new Date().toISOString(),collection:process.env.QDRANT_COLLECTION,embedding_model:process.env.EMBEDDING_MODEL,dimension:Number(process.env.EMBEDDING_DIMENSION),rows,passed:rows.every(r=>r.passed),limitation:'Topic-recall smoke evaluation only. Human citation relevance and complete maintenance-history coverage must also be reviewed.'};
 await fs.writeFile('retrieval-evaluation.local.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
}
main().catch(()=>{console.error('Live retrieval evaluation unavailable; no passing result recorded.');process.exitCode=1;});
