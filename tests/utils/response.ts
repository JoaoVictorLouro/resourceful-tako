import { BodyWithStatus, ExtractBodyFromResponse } from '@/util/api/body-with-status';
import { NextResponse } from 'next/server';
import { expect } from 'vitest';

export async function getValidResponse<T>(response: NextResponse<BodyWithStatus<T>>) {
  expect(response.ok, 'Response returned an invalid body').toBe(true);
  const body = (await response.json()) as ExtractBodyFromResponse<typeof response>;

  expect(response.status, 'Body status and response status should be the same').toBe(body.status);

  if (!('errors' in body)) {
    return body;
  }

  expect(body.errors, 'Returned an invalid response body').toBeUndefined();
  throw new Error('Returned an invalid response body');
}
