import { NextResponse } from 'next/server';

export class ErrorTranslatableToResponse extends Error {
  asResponse(): NextResponse {
    throw new Error('Method not implemented');
  }
}
