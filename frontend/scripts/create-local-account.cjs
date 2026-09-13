// Writes only a local private account file. Supply password via a secret environment variable.
const fs=require('node:fs');const crypto=require('node:crypto');
const names=['INTEGRATION_USERS_FILE','ACCOUNT_EMAIL','ACCOUNT_PASSWORD','ACCOUNT_TENANT','ACCOUNT_PLANT','ACCOUNT_ROLE'];
for(const name of names)if(!process.env[name])throw Error('Missing '+name);
if(process.env.ACCOUNT_PASSWORD.length<12)throw Error('Password must be at least 12 characters');
const file=process.env.INTEGRATION_USERS_FILE;let users=[];
if(fs.existsSync(file))users=JSON.parse(fs.readFileSync(file,'utf8'));
if(users.some(u=>u.email===process.env.ACCOUNT_EMAIL))throw Error('Account exists; no changes made');
const salt=crypto.randomBytes(16).toString('hex');
users.push({sub:crypto.randomUUID(),email:process.env.ACCOUNT_EMAIL,role:process.env.ACCOUNT_ROLE,tenant:process.env.ACCOUNT_TENANT,plant:process.env.ACCOUNT_PLANT,salt,password_hash:crypto.scryptSync(process.env.ACCOUNT_PASSWORD,salt,64).toString('hex')});
fs.writeFileSync(file,JSON.stringify(users),{mode:0o600});console.log('Local account file updated. No password or hash printed.');
