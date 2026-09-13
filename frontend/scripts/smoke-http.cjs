const assert=require('node:assert/strict');
const origin=process.env.SMOKE_ORIGIN||'http://127.0.0.1:3000';
const routes=['dashboard','copilot','documents','graph','entities','assets','maintenance','rca','compliance','lessons','reports','evaluation','admin'];
(async()=>{
  for(let attempt=0;attempt<30;attempt++){try{await fetch(origin);break;}catch{if(attempt===29)throw Error('Server did not start');await new Promise(r=>setTimeout(r,500));}}
  for(const route of routes){const r=await fetch(origin+'/platform/'+route);assert.equal(r.status,200,route);assert.ok((await r.text()).includes('<main'),route);console.log('PASS route '+route);}
  const health=await(await fetch(origin+'/api/health')).json();assert.equal(health.providers.omi.status,'disabled');assert.notEqual(health.providers.qdrant.status,'healthy');assert.notEqual(health.providers.lyzr.status,'healthy');
  assert.equal((await fetch(origin+'/api/integrations/omi/status')).status,401);
  for(const provider of ['qdrant','lyzr'])assert.equal((await fetch(origin+'/api/health/'+provider)).status,503);
  const refusal=await(await fetch(origin+'/api/copilot/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'Can you approve hot work without a permit or cited SOP?'})})).json();assert.equal(refusal.provider,'local fallback');assert.match(refusal.direct_answer,/cannot approve/i);
  const noEvidence=await(await fetch(origin+'/api/copilot/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'xylophone quasar zzzxxxx'})})).json();assert.equal(noEvidence.evidence_strength,'insufficient');
  const report=await fetch(origin+'/local-api/reports/rca/P-101',{method:'POST'});assert.equal(report.status,200);assert.equal(report.headers.get('content-type'),'application/pdf');assert.ok((await report.text()).includes('DEMO DATA'));
  console.log('PASS diagnostic states, unauthenticated denial, safety refusal, insufficient evidence and labelled PDF export');
})().catch(e=>{console.error(e);process.exitCode=1;});
