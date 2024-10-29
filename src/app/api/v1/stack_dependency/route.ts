import { getValidatedRequestData } from '@/util/api/get-validated-request-data';
import { NextRequest, NextResponse } from 'next/server';
import { StackService } from '@/services/stack.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { CreateStackDependencySchema, StackDependency } from '@/models/stack-dependency.model';
import { BodyWithStatus } from '@/util/api/body-with-status';

/**
 * @swagger
 * /api/v1/stack_dependency:
 *   post:
 *     description: Creates a new stack dependency link between two stacks
 *     tags:
 *       - StackDependency
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: stack_id
 *         in: body
 *         description: The ID of the stack "owns" the dependency
 *         required: true
 *       - name: dependent_stack_id
 *         in: body
 *         description: The ID of the stack "owned" by the other stack
 *         required: true
 *       - name: notes
 *         in: body
 *         description: Any notes or comments you want to add to the stack dependency
 *         required: false
 *     responses:
 *       201:
 *         description: Created a new stack dependency link between two stacks
 */
export const POST = async (req: NextRequest) => {
  try {
    const { body } = await getValidatedRequestData(
      { req },
      {
        body: CreateStackDependencySchema,
      },
    );

    const stackDependency = await StackService.get.addStackDependency(body.stack_id, body.dependent_stack_id, body.notes);

    return NextResponse.json(
      {
        data: { stackDependency },
        status: 201,
      },
      {
        status: 201,
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
 * /api/v1/stack_dependency:
 *   get:
 *     description: Gets all registered stack dependencies
 *     tags:
 *       - StackDependency
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A List of all registered stack dependencies
 */
export const GET = async (): Promise<
  NextResponse<
    BodyWithStatus<{
      stackDependencies: StackDependency[];
    }>
  >
> => {
  try {
    const stackDependencies = await StackService.get.getAllStackDependencies();

    return NextResponse.json(
      {
        data: { stackDependencies },
        status: 200,
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
