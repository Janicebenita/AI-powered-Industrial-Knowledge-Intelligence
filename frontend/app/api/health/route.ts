import { NextResponse } from 'next/server';
import { healthReport } from '@/lib/server/integrations/factory';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json(await healthReport());}
