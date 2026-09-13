export async function register(){
  if(process.env.NEXT_RUNTIME==='nodejs' && process.env.ENVIRONMENT==='production') {
    const {validateConfig,required}=await import('./lib/server/integrations/config');validateConfig();
    const {readFile}=await import('node:fs/promises');
    try {
      const accounts=JSON.parse(await readFile(required('INTEGRATION_USERS_FILE'),'utf8'));
      if(!Array.isArray(accounts)||!accounts.length||accounts.some(a=>!a.sub||!a.tenant||!a.plant||!a.role||!a.email||!/^[a-f0-9]{128}$/i.test(a.password_hash)||!/^[a-f0-9]{32,}$/i.test(a.salt)))throw Error();
    }catch{throw new Error('INTEGRATION_USERS_FILE must contain valid private account records');}
    const {readState}=await import('./lib/server/integrations/state');await readState();
  }
}
