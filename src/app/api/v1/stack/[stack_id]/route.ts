import { CreateStackSchema } from '@/models/stack.model';
import { StackService } from '@/services/stack.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequestContext } from '@/util/api/next-request-context';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/v1/stack/:stack_id:
 *   get:
 *     description: Gets a single stack from the database
 *     tags:
 *       - Stack
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The stack
 *         content:
 *           application/json:
 *            schema:
 *             $ref: '#/components/schemas/Stack'
 *       404:
 *         description: Stack not found
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/StackNotFoundError'
 */
export const GET = async (_req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { context },
      {
        params: z.object({
          stack_id: z.string(),
        }),
      },
    );

    const stack = await StackService.get.getStackById(params.stack_id);

    return NextResponse.json(
      {
        status: 200,
        data: { stack },
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

/**
 * @swagger
 * /api/v1/stack/:stack_id:
 *   patch:
 *     description: Updates a single stack from the database
 *     tags:
 *       - Stack
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The stack
 *         content:
 *           application/json:
 *            schema:
 *             $ref: '#/components/schemas/Stack'
 *       404:
 *         description: Stack not found
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/StackNotFoundError'
 */
export const PATCH = async (req: NextRequest, context: NextRequestContext) => {
  try {
    const { params, body } = await getValidatedRequestData(
      { context, req },
      {
        params: z.object({
          stack_id: z.string(),
        }),
        body: CreateStackSchema.partial(),
      },
    );

    let stack = await StackService.get.getStackById(params.stack_id);
    Object.assign(stack, body);

    stack = await StackService.get.updateStack(stack);

    return NextResponse.json(
      {
        status: 200,
        data: { stack },
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

/**
 * @swagger
 * /api/v1/stack/:stack_id:
 *   delete:
 *     description: Deletes a single stack from the database
 *     tags:
 *       - Stack
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The operation result
 *         content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: number
 *                 example: 200
 *       404:
 *         description: Stack not found
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/StackNotFoundError'
 */
export const DELETE = async (_req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { context },
      {
        params: z.object({
          stack_id: z.string(),
        }),
      },
    );

    await StackService.get.deleteStackById(params.stack_id);

    return NextResponse.json(
      {
        status: 200,
      },
      { status: 200 },
    );
  } catch (e) {
    if (e instanceof ErrorTranslatableToResponse) {
      return e.asResponse();
    }

    throw e;
  }
};
