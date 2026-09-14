// Consume measurements from an actual browser, never synthetic DOM widths.
const assert=require('node:assert/strict'),fs=require('node:fs');
const rows=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const routes=['dashboard','copilot','documents','graph','entities','assets','maintenance','rca','compliance','lessons','reports','evaluation','admin'];
const sizes=[[320,568],[360,800],[390,844],[412,915],[768,1024],[1366,900]];
for(const viewport of sizes)for(const route of routes){
 const matches=rows.filter(r=>r.route===route&&r.viewport[0]===viewport[0]&&r.viewport[1]===viewport[1]);
 assert.equal(matches.length,1,'Missing/duplicate measurement: '+route+' '+viewport);
 const r=matches[0];
 assert.equal(r.innerWidth,viewport[0],'Viewport override was not applied');
 assert.ok(r.width<=r.innerWidth&&r.width>=r.innerWidth-20,'Invalid client width');
 assert.ok(r.scroll<=r.width,'Document overflow: '+route+' '+viewport);
 assert.deepEqual(r.offenders,[],'Clipped content: '+route+' '+viewport);
}
console.log('PASS 78 real-browser route/viewport measurements; no document overflow or clipped content');
