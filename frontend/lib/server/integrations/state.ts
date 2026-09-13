import { mkdir, readFile, open, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { env, IntegrationError } from './config';
import type { Scope, Observation, Execution, Evidence, AuditProvider } from './contracts';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
type Event = { id: string; at: string; actor: string; tenant: string; plant: string; action: string; target: string; detail: string; previous: string; hash: string };
export type State = { version: 1; observations: Observation[]; executions: Execution[]; documents: Evidence[]; audit: Event[]; migrations: Record<string,string>; };
const empty = (): State => ({ version: 1, observations: [], executions: [], documents: [], audit: [], migrations: {} });
const directory = () => path.resolve(env('INTEGRATION_DATA_DIR') || '.integration-data');
export async function readState(): Promise<State> {
  try { const state = JSON.parse(await readFile(path.join(directory(),'state.json'),'utf8')); if (state.version !== 1 || !Array.isArray(state.audit)) throw Error(); return state; }
  catch(error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return empty(); throw new IntegrationError('storage_error','Integration state unreadable; restore backup before proceeding'); }
}
// Single Render instance. Atomic replacement and an interprocess exclusive lock prevent lost approvals.
// A lock surviving a process crash intentionally fails closed; operators inspect it before removal.
export async function transaction<T>(change: (state: State) => T): Promise<T> {
  await mkdir(directory(),{recursive:true});
  const lockPath = path.join(directory(),'state.lock');
  let lock;
  for(let i=0;i<100;i++) { try { lock=await open(lockPath,'wx',0o600); break; } catch(e) { if((e as NodeJS.ErrnoException).code !== 'EEXIST') throw new IntegrationError('storage_error','Cannot lock integration state'); await new Promise(r=>setTimeout(r,20)); } }
  if(!lock) throw new IntegrationError('storage_error','Integration storage busy; inspect stale lock if persistent');
  const temporary = path.join(directory(),`${randomUUID()}.tmp`);
  try {
    const state = await readState(); const result=change(state);
    const file=await open(temporary,'wx',0o600);
    try { await file.writeFile(JSON.stringify(state)); await file.sync(); } finally { await file.close(); }
    await rename(temporary,path.join(directory(),'state.json')); return result;
  } finally { await lock.close(); await unlink(lockPath); await unlink(temporary).catch(()=>undefined); }
}
export function auditEvent(state: State, scope: Scope, action: string, target: string, detail = '') {
  const entry = { id:randomUUID(), at:new Date().toISOString(), actor:scope.sub, tenant:scope.tenant, plant:scope.plant, organization_id:scope.tenant, plant_id:scope.plant, action, target, detail, previous:state.audit.at(-1)?.hash || '' };
  state.audit.push({...entry,hash:hash(JSON.stringify(entry))});
}
export const audit: AuditProvider = { async record(scope,action,target,detail) { await transaction(s=>auditEvent(s,scope,action,target,detail)); } };
export const sameScope = (item: {tenant:string;plant:string},scope:Scope) => item.tenant===scope.tenant && item.plant===scope.plant;
