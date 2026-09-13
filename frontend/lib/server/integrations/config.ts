export class IntegrationError extends Error {
  constructor(public code: string, message: string, public status = 503) { super(message); }
}
export const env = (name: string) => process.env[name]?.trim() || '';
export const lyzrAgentMode = () => env('LYZR_API_MODE')==='agent' || (!env('LYZR_WORKFLOW_ID') && !!env('LYZR_AGENT_ID'));
export const omiAssignment = () => ({tenant:env('OMI_ORGANIZATION_ID')||env('OMI_TENANT'),plant:env('OMI_PLANT_ID')||env('OMI_PLANT')});
export const production = () => env('ENVIRONMENT') === 'production';
export const modes = () => ({ voice: env('VOICE_PROVIDER') || 'disabled', vector: env('VECTOR_PROVIDER') || 'legacy', agent: env('AGENT_PROVIDER') || 'local', fallback: env('ALLOW_DEMO_FALLBACK') === 'true' });
export function required(name: string) { const value = env(name); if (!value) throw new IntegrationError('misconfigured', `Missing ${name}`); return value; }
export function baseUrl(name: string, defaultValue = '') {
  let url: URL;
  try { url = new URL(env(name) || defaultValue); } catch { throw new IntegrationError('misconfigured', `Invalid ${name}`); }
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && !production() && ['localhost','127.0.0.1'].includes(url.hostname)))) throw new IntegrationError('misconfigured', `${name} requires HTTPS without credentials, query or fragment`);
  return url.toString().replace(/\/$/, '');
}
export function validateConfig() {
  const m = modes();
  for (const [name, value, allowed] of [['VOICE_PROVIDER',m.voice,['omi','disabled']],['VECTOR_PROVIDER',m.vector,['qdrant','legacy']],['AGENT_PROVIDER',m.agent,['lyzr','local']]] as const) {
    if (!(allowed as readonly string[]).includes(value)) throw new IntegrationError('misconfigured', `Invalid ${name}`);
  }
  if (production()) {
    for (const name of ['VOICE_PROVIDER','VECTOR_PROVIDER','AGENT_PROVIDER','ALLOW_DEMO_FALLBACK','JWT_SECRET','INTEGRATION_USERS_FILE','INTEGRATION_DATA_DIR']) required(name);
    if (required('JWT_SECRET').length < 32) throw new IntegrationError('misconfigured', 'JWT_SECRET must contain at least 32 characters');
  }
  if (m.voice === 'omi') { required('OMI_API_KEY'); baseUrl('OMI_API_BASE_URL','https://api.omi.me'); if(!omiAssignment().tenant||!omiAssignment().plant)throw new IntegrationError('misconfigured','OMI_ORGANIZATION_ID and OMI_PLANT_ID required'); }
  if (m.vector === 'qdrant') {
    baseUrl('QDRANT_URL'); required('QDRANT_API_KEY'); required('QDRANT_COLLECTION');
    if (env('QDRANT_MIGRATION_VERIFIED') !== 'true') throw new IntegrationError('misconfigured','Qdrant migration and retrieval evaluation not approved');
    if (!['openai','fastembed'].includes(env('EMBEDDING_PROVIDER'))) throw new IntegrationError('misconfigured','EMBEDDING_PROVIDER must be openai or fastembed');
    if(env('EMBEDDING_PROVIDER')==='openai')required('EMBEDDING_API_KEY');
    required('EMBEDDING_MODEL');
    if(env('EMBEDDING_PROVIDER')==='fastembed'&&(env('EMBEDDING_MODEL')!=='BAAI/bge-small-en-v1.5'||env('EMBEDDING_DIMENSION')!=='384'))throw new IntegrationError('misconfigured','FastEmbed requires BAAI/bge-small-en-v1.5 and dimension 384');
    const dimension = Number(required('EMBEDDING_DIMENSION'));
    if (!Number.isInteger(dimension) || dimension < 1 || dimension > 65536) throw new IntegrationError('misconfigured','Invalid EMBEDDING_DIMENSION');
  }
  if (m.agent === 'lyzr') { required('LYZR_API_KEY'); required(lyzrAgentMode()?'LYZR_AGENT_ID':'LYZR_WORKFLOW_ID'); baseUrl('LYZR_API_BASE_URL','https://agent-prod.studio.lyzr.ai'); if(!lyzrAgentMode())baseUrl('APP_BASE_URL'); }
}
