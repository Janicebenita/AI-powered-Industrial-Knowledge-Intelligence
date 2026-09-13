import { createHmac, timingSafeEqual, scryptSync } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { env, required, IntegrationError, production } from './config';
import type { Scope } from './contracts';
const roles = ['plant_manager','reliability_engineer','maintenance_engineer','operator','safety_officer','quality_manager','compliance_auditor','executive'];
type Account = Scope & { email: string; salt: string; password_hash: string; disabled?: boolean };
async function accounts(): Promise<Account[]> {
  try { const data=JSON.parse(await readFile(required('INTEGRATION_USERS_FILE'),'utf8')); if(!Array.isArray(data)) throw Error(); return data; }
  catch { throw new IntegrationError('misconfigured','INTEGRATION_USERS_FILE must contain configured user accounts'); }
}
export function sign(payload: object) {
  const encoded=Buffer.from(JSON.stringify(payload)).toString('base64url');
  return encoded+'.'+createHmac('sha256',required('JWT_SECRET')).update(encoded).digest('base64url');
}
export function verify(token: string): Record<string,unknown> {
  const parts=token.split('.'); if(parts.length!==2) throw new IntegrationError('unauthorized','Sign in required',401);
  const expected=createHmac('sha256',required('JWT_SECRET')).update(parts[0]).digest(); const supplied=Buffer.from(parts[1],'base64url');
  if(expected.length!==supplied.length || !timingSafeEqual(expected,supplied)) throw new IntegrationError('unauthorized','Invalid session',401);
  let data; try { data=JSON.parse(Buffer.from(parts[0],'base64url').toString()); } catch { throw new IntegrationError('unauthorized','Invalid session',401); }
  if(typeof data.exp!=='number' || data.exp<Date.now()) throw new IntegrationError('unauthorized','Session expired',401);
  return data;
}
export async function login(email:string,password:string) {
  const user=(await accounts()).find(u=>u.email===email && !u.disabled);
  const actual=scryptSync(password,user?.salt || 'invalid-user-timing-salt',64);
  const expected=Buffer.from(user?.password_hash || '00'.repeat(64),'hex');
  if(!user || actual.length!==expected.length || !timingSafeEqual(actual,expected)) throw new IntegrationError('unauthorized','Invalid email or password',401);
  return sign({sub:user.sub,exp:Date.now()+8*60*60*1000,purpose:'session'});
}
export async function identity(request:Request,permission:'read'|'write'|'approve'|'admin'='read'):Promise<Scope> {
  const token=request.headers.get('authorization')?.replace(/^Bearer /,'') || request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('industrial_session='))?.slice(19);
  if(!token) throw new IntegrationError('unauthorized','Sign in required for integration records',401);
  const payload=verify(token); if(payload.purpose!=='session') throw new IntegrationError('unauthorized','Invalid session purpose',401);
  const user=(await accounts()).find(u=>u.sub===payload.sub && !u.disabled);
  if(!user || !roles.includes(user.role) || !user.tenant || !user.plant) throw new IntegrationError('unauthorized','Account unavailable',401);
  const allowed= permission==='read' || (permission==='admin' ? user.role==='plant_manager' : permission==='approve' ? ['plant_manager','safety_officer'].includes(user.role) : ['plant_manager','reliability_engineer','maintenance_engineer','safety_officer','quality_manager'].includes(user.role));
  if(!allowed) throw new IntegrationError('forbidden','Role does not permit this operation',403);
  return {sub:user.sub,role:user.role,tenant:user.tenant,plant:user.plant,organization_id:user.tenant,plant_id:user.plant};
}
const buckets=new Map<string,{count:number;until:number}>();
export function rateLimit(key:string,max=30) {
  const now=Date.now(); for(const [k,v] of buckets) if(v.until<now) buckets.delete(k);
  const bucket=buckets.get(key)||{count:0,until:now+60000};
  if(++bucket.count>max) throw new IntegrationError('rate_limited','Too many requests; retry in one minute',429);
  buckets.set(key,bucket);
}
export function sameOrigin(request:Request) {
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin && origin!==env('APP_BASE_URL')) throw new IntegrationError('forbidden','Cross-origin write denied',403);
  if(production() && request.headers.get('sec-fetch-site')==='cross-site') throw new IntegrationError('forbidden','Cross-site write denied',403);
}
export async function bodyObject(request:Request) {
  if(Number(request.headers.get('content-length')||0)>131072) throw new IntegrationError('invalid_input','Request too large',413);
  const raw=await request.text(); if(raw.length>131072) throw new IntegrationError('invalid_input','Request too large',413);
  try { const body=JSON.parse(raw); if(!body || typeof body!=='object' || Array.isArray(body)) throw Error(); return body as Record<string,unknown>; } catch { throw new IntegrationError('invalid_input','JSON object required',400); }
}
export function textField(value:unknown,name:string,max=2000) { if(typeof value!=='string' || !value.trim() || value.length>max) throw new IntegrationError('invalid_input',`${name} must be nonempty text, at most ${max} characters`,400); return value.trim(); }
