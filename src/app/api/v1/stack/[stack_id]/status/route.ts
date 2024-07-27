import { getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StackService } from '@/services/stack.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { NextRequestContext } from '@/util/api/next-request-context';

/**
 * @swagger
 * /api/v1/stack/:stack_id/status:
 *   get:
 *     description: Retrieves a stack status from the Docker daemon
 *     tags:
 *       - Stack
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stack_id
 *         in: path
 *         description: The ID of the stack to retrieve the status
 *         required: true
 *     responses:
 *       200:
 *         description: Returns the status of the stack from the Docker daemon
 */
export const GET = async (req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { req, context },
      {
        params: z.object({
          stack_id: z.string(),
        }),
      },
    );

    const status = await StackService.get.getStackStatus(params.stack_id);

    return NextResponse.json(
      {
        data: {
          status,
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
