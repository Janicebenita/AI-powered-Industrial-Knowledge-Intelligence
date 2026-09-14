export type SessionUser = {sub:string;role:string;tenant:string;plant:string};
export function safeReturnPath(value:string|null):string {
  if(!value || !value.startsWith('/') || value.startsWith('//') || Array.from(value).some(c=>c.charCodeAt(0)<=32 || c.charCodeAt(0)===92))return '/platform/copilot';
  const url=new URL(value,'https://application.invalid');
  return url.origin==='https://application.invalid' && url.pathname!=='/login' ? url.pathname+url.search+url.hash : '/platform/copilot';
}
export function loginLocation(path:string):string {return '/login?returnTo='+encodeURIComponent(safeReturnPath(path));}
export async function sessionRequest(method='GET',credentials?:{email:string;password:string}):Promise<SessionUser|null> {
  const response=await fetch('/api/integrations/session',{method,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},...(credentials?{body:JSON.stringify(credentials)}:{})});
  if(response.status===401 && method==='GET')return null;
  if(!response.ok)throw new Error(method==='POST'?'Sign in failed. Check your credentials and try again.':'Session request failed. Please try again.');
  return method==='GET'?await response.json() as SessionUser:null;
}
