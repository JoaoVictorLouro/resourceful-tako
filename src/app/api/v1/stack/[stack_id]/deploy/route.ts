import { NextRequestContext } from '@/util/api/next-request-context';
import { getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StackService } from '@/services/stack.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';

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
 *       - name: deploy_dependents
 *         in: query
 *         description: Whether to redeploy the dependents of the stack
 *         default: true
 *         example: false
 *         required: false
 *     responses:
 *       200:
 *         description: Deploys the stack the Docker daemon
 */
export const POST = async (req: NextRequest, context: NextRequestContext) => {
  try {
    const { params, query } = await getValidatedRequestData(
      { req, context },
      {
        params: z.object({
          stack_id: z.string(),
        }),
        query: z.object({
          deploy_dependents: z.coerce.string().transform(v => v === 'true'),
        }),
      },
    );

    const { result, stack } = await StackService.get.deployStack(params.stack_id, query.deploy_dependents);

    return new NextResponse(
      JSON.stringify({
        result,
        stack,
      }),
    );
  } catch (e) {
    if (e instanceof ErrorTranslatableToResponse) {
      return e.asResponse();
    }

    throw e;
  }
};
