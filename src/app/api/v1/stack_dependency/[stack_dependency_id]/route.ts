import { NextRequestContext } from '@/util/api/next-request-context';
import { getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StackService } from '@/services/stack.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { CreateStackDependencySchema } from '@/models/stack-dependency.model';
import { BodyWithStatus } from '@/util/api/body-with-status';
import { StackDependency } from '@prisma/client';

/**
 * @swagger
 * /api/v1/stack_dependency/:stack_dependency_id:
 *   get:
 *     description: Gets a single stack dependency link information from the database
 *     tags:
 *       - StackDependency
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: The stack dependency link
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StackDependency'
 *       404:
 *         description: StackDependency not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StackDependencyNotFoundError'
 */
export const GET = async (_req: NextRequest, context: NextRequestContext) => {
  try {
    const { params } = await getValidatedRequestData(
      { context },
      {
        params: z.object({
          stack_dependency_id: z.string(),
        }),
      },
    );

    const stackDependency = await StackService.get.getStackDependencyById(params.stack_dependency_id);

    return NextResponse.json(
      {
        status: 200,
        data: { stackDependency },
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
 * /api/v1/stack_dependency/:stack_dependency_id:
 *   patch:
 *     description: Updates a stack dependency properties
 *     tags:
 *       - StackDependency
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stack_dependency_id
 *         in: path
 *         description: The ID of the stack dependency to update
 *         required: true
 *     responses:
 *       200:
 *         description: The update to the stack dependency has been applied
 */
export const PATCH = async (
  req: NextRequest,
  context: NextRequestContext,
): Promise<
  NextResponse<
    BodyWithStatus<{
      stackDependency: StackDependency;
    }>
  >
> => {
  try {
    const { params, body } = await getValidatedRequestData(
      { req, context },
      {
        params: z.object({
          stack_dependency_id: z.string(),
        }),
        body: CreateStackDependencySchema.partial(),
      },
    );

    const stackDependency = await StackService.get.getStackDependencyById(params.stack_dependency_id);

    Object.assign(stackDependency, body);

    await StackService.get.updateStackDependency(stackDependency);

    return NextResponse.json(
      {
        data: { stackDependency },
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

/**
 * @swagger
 * /api/v1/stack_dependency/:stack_dependency_id:
 *   delete:
 *     description: Deletes a stack dependency link
 *     tags:
 *       - StackDependency
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stack_dependency_id
 *         in: path
 *         description: The ID of the stack dependency to delete
 *         required: true
 *     responses:
 *       200:
 *         description: The stack dependency has been deleted
 */
export const DELETE = async (_req: NextRequest, context: NextRequestContext): Promise<NextResponse<BodyWithStatus<null>>> => {
  try {
    const { params } = await getValidatedRequestData(
      { context },
      {
        params: z.object({
          stack_dependency_id: z.string(),
        }),
      },
    );

    await StackService.get.deleteStackDependencyById(params.stack_dependency_id);

    return NextResponse.json(
      {
        status: 200,
        data: null,
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
