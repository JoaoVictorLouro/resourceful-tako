import { getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StackService } from '@/services/stack.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { NextRequestContext } from '@/util/api/next-request-context';
import { BodyWithStatus } from '@/util/api/body-with-status';
import { Stack } from '@prisma/client';
import { IDockerComposeResult } from 'docker-compose';

/**
 * @swagger
 * /api/v1/stack/:stack_id/deploy:
 *   post:
 *     description: Deploys a stack to the Docker daemon
 *     tags:
 *       - Stack
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stack_id
 *         in: path
 *         description: The ID of the stack to deploy
 *         required: true
 *     responses:
 *       200:
 *         description: Deploys the stack the Docker daemon
 */
export const POST = async (
  req: NextRequest,
  context: NextRequestContext,
): Promise<
  NextResponse<
    BodyWithStatus<{
      stack: Stack;
      result: IDockerComposeResult;
    }>
  >
> => {
  try {
    const { params } = await getValidatedRequestData(
      { req, context },
      {
        params: z.object({
          stack_id: z.string(),
        }),
      },
    );

    const { result, stack } = await StackService.get.deployStack(params.stack_id);

    return NextResponse.json(
      {
        status: 200,
        data: {
          result,
          stack,
        },
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    if (e instanceof ErrorTranslatableToResponse) {
      return e.asResponse();
    }

    throw e;
  }
};
