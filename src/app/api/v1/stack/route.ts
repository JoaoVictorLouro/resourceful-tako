import { CreateStackSchema } from '@/models/stack.model';
import { StackService } from '@/services/stack.service';
import { getValidatedRequestData, InvalidRequestError } from '@/util/api/get-validated-request-data';
import { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/v1/stack:
 *   post:
 *     description: Creates a new stack
 *     tags:
 *       - stack
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         in: body
 *         description: The name of the stack
 *         required: true
 *       - name: code
 *         in: body
 *         description: String containing the YAML code of the docker compose file
 *         required: true
 *         example: "version: '3'\nservices:\n nginx:\n image: nginx:latest\n ports:\n - '7072:80'"
 *       - name: cwd
 *         in: body
 *         description: The current working directory of the stack deployment, use this if you are using any relative paths or Dockerfile in your yaml code
 *         required: false
 *       - name: notes
 *         in: body
 *         description: Any notes or comments you want to add to the stack
 *         required: false
 *     responses:
 *       200:
 *         description: The created stack
 *         content:
 *           application/json:
 *            schema:
 *             $ref: '#/components/schemas/stack'
 */
export const POST = async (req: NextRequest) => {
  try {
    const { body } = await getValidatedRequestData({ req }, { body: CreateStackSchema });
    const createdStack = await StackService.get.createStack(body);
    return Response.json({ status: 200, data: { stack: createdStack } }, { status: 200 });
  } catch (e) {
    if (e instanceof InvalidRequestError) {
      return e.asResponse();
    }
    throw e;
  }
};
