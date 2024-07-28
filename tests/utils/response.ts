import { BodyWithStatus, ExtractBodyFromResponse } from '@/util/api/body-with-status';
import { NextResponse } from 'next/server';
import { expect } from 'vitest';

export async function getValidResponse<T>(response: NextResponse<BodyWithStatus<T>>) {
  const body = (await response.json()) as ExtractBodyFromResponse<typeof response>;
  if (!response.ok) {
    console.error('Invalid response body:');
    console.error(body);
  }
  expect(response.ok, 'Response returned an invalid status').toBe(true);

  expect(response.status, 'Body status and response status should be the same').toBe(body.status);

  if (!('errors' in body)) {
    return body;
  }

  expect(body.errors, 'Returned an invalid response body').toBeUndefined();
  throw new Error('Returned an invalid response body');
}

export async function getInvalidResponse<T>(response: NextResponse<BodyWithStatus<T>>) {
  expect(response.ok, 'Response returned a valid status, expected invalid').toBe(false);
  const body = (await response.json()) as ExtractBodyFromResponse<typeof response>;

  expect(response.status, 'Body status and response status should be the same').toBe(body.status);

  if (!('errors' in body)) {
    expect('errors' in body, 'Returned an valid response body, expected invalid').toBeFalsy();
    throw new Error('Returned a valid response body, expected invalid');
  }

  return body;
}
