require('./register-typescript.cjs');
const assert=require('node:assert/strict'),cp=require('node:child_process'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream');
const {FastEmbedProvider}=require('../lib/server/integrations/fastembed.ts');
Object.assign(process.env,{EMBEDDING_MODEL:'BAAI/bge-small-en-v1.5',EMBEDDING_DIMENSION:'384',OMI_API_KEY:'test-only-must-not-inherit'});
let received,options,response={vectors:[Array(384).fill(0.1)]},exitCode=0;
const original=cp.spawn;
cp.spawn=(binary,args,opts)=>{options=opts;const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.kill=()=>{};let input='';child.stdin.on('data',b=>input+=b);child.stdin.on('finish',()=>{received=JSON.parse(input);child.stdout.emit('data',Buffer.from(JSON.stringify(response)));child.emit('close',exitCode);});return child;};
(async()=>{
 const p=new FastEmbedProvider();assert.equal((await p.embed(['pump'],'query'))[0].length,384);assert.equal(received.purpose,'query');assert.equal(options.shell,false);assert.equal(options.windowsHide,true);assert.equal(options.env.OMI_API_KEY,undefined);assert.equal(options.env.HF_HUB_OFFLINE,'1');console.log('PASS FastEmbed protocol, query purpose and secret isolation');
 response={vectors:[[1,2]]};await assert.rejects(()=>p.embed(['pump']),/dimension/);console.log('PASS FastEmbed rejects invalid dimensions');
 exitCode=1;await assert.rejects(()=>p.embed(['pump']),/FastEmbed failed/);console.log('PASS FastEmbed worker failure is explicit');
 await assert.rejects(()=>p.embed(Array(33).fill('pump')),/batch too large/);console.log('PASS FastEmbed batch limits');
 process.env.EMBEDDING_DIMENSION='768';await assert.rejects(()=>p.embed(['pump']),/dimension 384/);console.log('PASS FastEmbed configuration mismatch');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>{cp.spawn=original;});
