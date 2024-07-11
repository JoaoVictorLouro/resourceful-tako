import { EnvService } from '@/services/env.service';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const expectedApiKey = EnvService.instance.apiKey;

  if (req.nextUrl.pathname.startsWith('/api/v1') && apiKey !== expectedApiKey) {
    return NextResponse.json({ error: 'Unauthorized', status: 401 }, { status: 401 });
  }
}
