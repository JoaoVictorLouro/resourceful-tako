import { InvalidRequestErrorResponseData } from '@/util/api/get-validated-request-data';
import { NextResponse } from 'next/server';

export type BodyWithValidStatus<T> = {
  status: number;
  data: T;
};

export type BodyWithStatus<T> = BodyWithValidStatus<T> | InvalidRequestErrorResponseData;

export type ExtractBodyFromData<T> = T extends BodyWithStatus<infer U> ? U : never;

export type ExtractBodyFromResponse<T extends NextResponse> = T extends NextResponse<BodyWithStatus<infer U>> ? BodyWithStatus<U> : never;
