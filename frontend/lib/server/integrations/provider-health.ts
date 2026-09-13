import { IntegrationError } from './config';
import type { Health } from './contracts';
const successful=new Map<string,string>();
export async function checkHealth(provider:string,probe:()=>Promise<Partial<Health>>):Promise<Health> {
  const checked_at=new Date().toISOString();
  try { const details=await probe(); const status=details.status||'healthy'; if(status==='healthy') successful.set(provider,checked_at); return {provider,status,checked_at,last_success:successful.get(provider)||null,detail:'Runtime probe succeeded',...details}; }
  catch(error) { return {provider,status:error instanceof IntegrationError && error.code==='misconfigured'?'misconfigured':'unavailable',checked_at,last_success:successful.get(provider)||null,detail:error instanceof IntegrationError?error.message:'Provider probe failed'}; }
}
