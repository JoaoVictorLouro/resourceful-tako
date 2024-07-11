import { CreateStackSchema } from '@/models/stack.model';
import { StackNotFoundError, StackService } from '@/services/stack.service';
import { InvalidRequestError, getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequestContext } from '@/util/api/next-request-context';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * @swagger
 * /api/v1/stack/:stackid:
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
export const GET = async (req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { context },
      {
        params: z.object({
          stackid: z.string(),
        }),
      },
    );

    const stack = await StackService.get.getStackById(params.stackid);

    return new NextResponse(
      JSON.stringify({
        status: 200,
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

/**
 * @swagger
 * /api/v1/stack/:stackid:
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
          stackid: z.string(),
        }),
        body: CreateStackSchema.partial(),
      },
    );

    let stack = await StackService.get.getStackById(params.stackid);
    Object.assign(stack, body);

    stack = await StackService.get.saveStack(stack);

    return new NextResponse(
      JSON.stringify({
        status: 200,
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

/**
 * @swagger
 * /api/v1/stack/:stackid:
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
export const DELETE = async (req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { context, req },
      {
        params: z.object({
          stackid: z.string(),
        }),
      },
    );

    await StackService.get.deleteStackById(params.stackid);

    return new NextResponse(
      JSON.stringify({
        status: 200,
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
