require('./register-typescript.cjs');
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'browser-session-'));
const salt=crypto.randomBytes(16).toString('hex'),password=crypto.randomBytes(24).toString('hex');
const account={sub:'fixture-reader',email:'reader@example.test',role:'operator',tenant:'industrial-brain-ai',plant:'plant-a',salt,password_hash:crypto.scryptSync(password,salt,64).toString('hex')};
Object.assign(process.env,{INTEGRATION_USERS_JSON:JSON.stringify([account]),JWT_SECRET:crypto.randomBytes(32).toString('hex'),INTEGRATION_DATA_DIR:temp});
const {integrationApi}=require('../lib/server/integrations/api.ts');const {identity,sign,sessionCookie}=require('../lib/server/integrations/auth.ts');const {readState}=require('../lib/server/integrations/state.ts');const {sessionRequest,safeReturnPath,loginLocation}=require('../lib/browser-session.ts');
let cookie='',calls=[];
global.fetch=async(url,options={})=>{assert.equal(url,'/api/integrations/session','Provider/network call forbidden');calls.push(options.method);assert.equal(options.credentials,'same-origin');return integrationApi(new Request('https://app.example.test'+url,{...options,headers:{...options.headers,...(cookie?{Cookie:cookie}:{})}}),['session']).then(r=>{const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return r;});};
(async()=>{try{
assert.equal(await sessionRequest(),null);
await assert.rejects(()=>sessionRequest('POST',{email:account.email,password:'incorrect'}));
await sessionRequest('POST',{email:account.email,password});const user=await sessionRequest();assert.equal(user.role,'operator');assert.equal(user.plant,'plant-a');assert.equal(user.sub,account.sub);assert.equal(user.password_hash,undefined);
const request=new Request('https://app.example.test',{headers:{Cookie:cookie}});await assert.rejects(()=>identity(request,'approve'),e=>e.status===403);await assert.rejects(()=>identity(request,'write'),e=>e.status===403);await assert.rejects(()=>identity(request,'admin'),e=>e.status===403);
const secure=sessionCookie('fixture',request);for(const part of ['HttpOnly','SameSite=Strict','Secure','Max-Age=28800','Path=/'])assert.ok(secure.includes(part));
const old=process.env.NODE_ENV;process.env.NODE_ENV='production';assert.ok(sessionCookie('fixture',new Request('http://localhost')).includes('Secure'));if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old;
await sessionRequest('DELETE');assert.equal(await sessionRequest(),null);assert.ok(sessionCookie('',request).includes('Max-Age=0'));
cookie='industrial_session='+sign({sub:account.sub,purpose:'session',exp:Date.now()-1});assert.equal(await sessionRequest(),null);
for(const unsafe of ['https://evil.test','//evil.test','/\\evil.test','/login','/path\n'])assert.equal(safeReturnPath(unsafe),'/platform/copilot');
assert.equal(safeReturnPath('/platform/copilot?question=history'),'/platform/copilot?question=history');assert.equal(loginLocation('/platform/reports'),'/login?returnTo=%2Fplatform%2Freports');
const audit=(await readState()).audit;assert.deepEqual(audit.map(e=>e.action),['session.login','session.logout']);assert.ok(audit.every(e=>e.plant==='plant-a'&&e.tenant==='industrial-brain-ai'));assert.ok(!JSON.stringify(audit).includes(password));
// Mount the real provider to exercise startup restoration and shared login/logout state.
const React=require('react'),{createRoot}=require('react-dom/client'),{JSDOM}=require('jsdom');
const dom=new JSDOM('<div id="root"></div>',{url:'https://app.example.test/platform/copilot'});
global.window=dom.window;global.document=dom.window.document;global.navigator=dom.window.navigator;global.IS_REACT_ACT_ENVIRONMENT=true;
const {SessionProvider,useSession}=require('../components/session-provider.tsx');let current;
function Probe(){current=useSession();return React.createElement('span',null,current.loading?'loading':current.user?.role||'signed out');}
const root=createRoot(document.getElementById('root'));
await React.act(async()=>{root.render(React.createElement(SessionProvider,null,React.createElement(Probe)));});
assert.equal(current.loading,false);assert.equal(current.user,null);
await React.act(async()=>{await current.signIn(account.email,password);});assert.equal(current.user.role,'operator');
await React.act(async()=>{root.unmount();});
const restored=createRoot(document.getElementById('root'));await React.act(async()=>{restored.render(React.createElement(SessionProvider,null,React.createElement(Probe)));});assert.equal(current.user.sub,account.sub);
await React.act(async()=>{await sessionRequest('DELETE');await current.refresh();});assert.equal(current.user,null);
await React.act(async()=>{restored.unmount();});dom.window.close();
console.log('PASS mounted session context plus session restoration, login failure/success, logout, expiry, cookies, safe redirects, restricted RBAC and audit; zero provider calls');
}finally{fs.rmSync(temp,{recursive:true,force:true});}})().catch(e=>{console.error(e.message);process.exitCode=1;});
