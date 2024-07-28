import { NextRequest } from 'next/server';

export function mockRequest(config: { path?: string; method?: string; body?: Record<string, unknown> }) {
  return new NextRequest(`https://localhost:3000${config.path || '/mocked'}`, {
    method: config.method || 'GET',
    body: config.body ? JSON.stringify(config.body) : undefined,
  });
}
