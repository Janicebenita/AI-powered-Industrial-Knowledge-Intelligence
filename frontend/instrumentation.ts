export async function register(){
  if(process.env.NEXT_RUNTIME==='nodejs' && process.env.ENVIRONMENT==='production') {
    const {validateConfig}=await import('./lib/server/integrations/config');validateConfig();
    const {accounts:loadAccounts}=await import('./lib/server/integrations/auth');
    try {
      const accounts=await loadAccounts();
      if(!Array.isArray(accounts)||!accounts.length||accounts.some(a=>!a.sub||!a.tenant||!a.plant||!a.role||!a.email||!/^[a-f0-9]{128}$/i.test(a.password_hash)||!/^[a-f0-9]{32,}$/i.test(a.salt)))throw Error();
    }catch{throw new Error('INTEGRATION_USERS_FILE must contain valid private account records');}
    const {readState}=await import('./lib/server/integrations/state');await readState();
  }
}
