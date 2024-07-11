import { NextRequestContext } from '@/util/api/next-request-context';
import { InvalidRequestError, getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StackNotFoundError, StackService } from '@/services/stack.service';

/**
 * @swagger
 * /api/v1/stack/:stackid/deploy:
 *   post:
 *     description: Deploys a stack to the Docker daemon
 *     tags:
 *       - Stack
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stackid
 *         in: path
 *         description: The ID of the stack to deploy
 *         required: true
 *     responses:
 *       200:
 *         description: Deploys the stack the Docker daemon
 */
export const POST = async (req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { context },
      {
        params: z.object({
          stackid: z.string(),
        }),
      },
    );

    const { result, stack } = await StackService.get.deployStack(params.stackid);

    return new NextResponse(
      JSON.stringify({
        result,
        stack,
      }),
    );
  } catch (e) {
    if (e instanceof InvalidRequestError) {
      return e.asResponse();
    } else if (e instanceof StackNotFoundError) {
      return e.asResponse();
    }

    throw e;
  }
};
