"use client";
import {useState} from 'react';
import {useSession} from '@/components/session-provider';
import {safeReturnPath} from '@/lib/browser-session';
export default function LoginPage(){const {signIn}=useSession();const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
return <main className="mx-auto max-w-lg px-5 py-12"><h1 className="text-3xl font-bold">Sign in to Industrial Brain AI</h1><p className="my-4">Use your assigned account to access scoped plant evidence. The visual demo persona does not grant permissions.</p><form className="grid gap-4" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{await signIn(email,password);setPassword('');window.location.assign(safeReturnPath(new URLSearchParams(window.location.search).get('returnTo')));}catch(e){setError(e instanceof Error?e.message:'Sign in failed');setPassword('');}finally{setBusy(false);}}}>
<label className="grid gap-1">Email<input className="min-w-0 rounded border bg-slate-950 p-3" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={200}/></label>
<label className="grid gap-1">Password<input className="min-w-0 rounded border bg-slate-950 p-3" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required maxLength={200}/></label>
<button className="rounded bg-blue-600 p-3 text-white" disabled={busy}>{busy?'Signing in...':'Sign in'}</button>{error&&<p role="alert">{error}</p>}</form><p className="mt-6 text-sm">Hackathon guests: request a restricted Plant A demonstration account from the organizer. Signing in does not authorize operational work.</p></main>;}
