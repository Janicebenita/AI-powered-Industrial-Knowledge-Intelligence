import { NextResponse } from 'next/server';
import { healthReport } from '@/lib/server/integrations/factory';
export const dynamic='force-dynamic';
export async function GET(_:Request,context:{params:Promise<{provider:string}>}) {const {provider}=await context.params;const report=await healthReport();if(!['omi','qdrant','lyzr'].includes(provider))return NextResponse.json({detail:'Unknown provider'},{status:404});const health=report.providers[provider as keyof typeof report.providers];return NextResponse.json(health,{status:['healthy','disabled'].includes(health.status)?200:503});}
