"use client";
import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {sessionRequest,loginLocation,type SessionUser} from '@/lib/browser-session';
type Session = {user:SessionUser|null;loading:boolean;error:string;refresh:()=>Promise<void>;signIn:(email:string,password:string)=>Promise<void>;signOut:()=>Promise<void>};
const Context=createContext<Session>({user:null,loading:true,error:'',refresh:async()=>{},signIn:async()=>{},signOut:async()=>{}});
export function SessionProvider({children}:{children:React.ReactNode}) {
  const [user,setUser]=useState<SessionUser|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const refresh=useCallback(async()=>{try{setUser(await sessionRequest());setError('');}catch{setUser(null);setError('Session unavailable. Please sign in again.');}finally{setLoading(false);}},[]);
  useEffect(()=>{void refresh();},[refresh]);
  async function signIn(email:string,password:string){await sessionRequest('POST',{email,password});const restored=await sessionRequest();if(!restored)throw new Error('Session could not be restored.');setUser(restored);setError('');}
  async function signOut(){await sessionRequest('DELETE');setUser(null);setError('');window.location.assign('/login');}
  return <Context.Provider value={{user,loading,error,refresh,signIn,signOut}}>{children}</Context.Provider>;
}
export const useSession=()=>useContext(Context);
export function requestSignIn(){window.location.assign(loginLocation(window.location.pathname+window.location.search+window.location.hash));}
export function SessionControls(){const {user,loading,error,signOut}=useSession();const [failure,setFailure]=useState('');return <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-sm" aria-label="Authenticated session">
  {loading?<span>Checking session...</span>:user?<><span className="break-all">Signed in: {user.sub}</span><span>Authorized role: {user.role} | {user.plant}</span><button className="rounded border px-3 py-2" onClick={()=>void signOut().catch(()=>setFailure('Sign out failed. Please retry.'))}>Sign out</button></>:<button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={requestSignIn}>Sign in to use live evidence</button>}
  {(error||failure)&&<p role="alert">{error||failure}</p>}
</div>;}
