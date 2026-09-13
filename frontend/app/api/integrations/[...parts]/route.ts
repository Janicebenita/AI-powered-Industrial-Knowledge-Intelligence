import { integrationApi } from '@/lib/server/integrations/api';
export const runtime='nodejs';
export const dynamic='force-dynamic';
async function handler(request:Request,context:{params:Promise<{parts:string[]}>}) {return integrationApi(request,(await context.params).parts);}
export {handler as GET,handler as POST,handler as DELETE};
