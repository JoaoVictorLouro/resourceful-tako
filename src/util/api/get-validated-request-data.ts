import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { NextRequestContext } from '@/util/api/next-request-context';
import { NextRequest, NextResponse } from 'next/server';
import { Schema, z } from 'zod';

export type InvalidRequestErrorResponseData = {
  status: number;
  message: string;
  errors: (z.ZodIssue | { code: string; message: string })[];
};

export type InvalidRequestErrorResponse = NextResponse<InvalidRequestErrorResponseData>;

export class InvalidRequestError extends ErrorTranslatableToResponse {
  public readonly zodError: z.ZodError;
  constructor(err: z.ZodError) {
    super('The requst data is invalid.');
    this.zodError = err;
  }

  asResponse(): InvalidRequestErrorResponse {
    return NextResponse.json(
      {
        status: 400,
        message: 'Invalid request data.',
        errors: this.zodError.errors,
      },
      {
        status: 400,
      },
    );
  }
}

export async function getValidatedRequestData<
  BodySchema extends Schema | void = void,
  QuerySchema extends Schema | void = void,
  ParamsSchema extends Schema | void = void,
>(
  data: {
    req?: NextRequest;
    context?: NextRequestContext;
  },
  schema: {
    body?: BodySchema;
    query?: QuerySchema;
    params?: ParamsSchema;
  },
): Promise<{
  params: ParamsSchema extends void ? null : z.infer<Exclude<ParamsSchema, void>>;
  body: BodySchema extends void ? null : z.infer<Exclude<BodySchema, void>>;
  query: QuerySchema extends void ? null : z.infer<Exclude<QuerySchema, void>>;
}> {
  try {
    if (schema.params && !data.context) {
      throw new Error('The `context` is required when validating `params`.');
    }

    if ((schema.query || schema.body) && !data.req) {
      throw new Error('The `req` is required when validating `body` or `query`.');
    }

    const body = schema.body && data.req ? await schema.body.parseAsync(await data.req.json()) : undefined;
    const query =
      schema.query && data.req ? await schema.query.parseAsync(Object.fromEntries(data.req.nextUrl.searchParams.entries())) : undefined;
    const params = schema.params && data.context ? await schema.params.parseAsync(data.context.params) : undefined;

    return { body, query, params };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new InvalidRequestError(error);
    }
    throw error;
  }
}
