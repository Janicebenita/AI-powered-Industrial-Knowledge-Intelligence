import { NextResponse } from 'next/server';
import { healthReport } from '@/lib/server/integrations/factory';
export const dynamic='force-dynamic';
export async function GET(){const report=await healthReport();return NextResponse.json(report,{status:report.ready?200:503});}
