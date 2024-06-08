import { PrismaService } from '@/services/prisma.service';

/**
 * @swagger
 * /api/hello:
 *   get:
 *     description: Returns the hello world
 *     responses:
 *       200:
 *         description: Hello World!
 */
export async function POST(request: Request) {
  const prisma = await PrismaService.get();
  const allStacks = await prisma.stack.findMany();

  console.log({ allStacks });

  return new Response('Hello, world!');
}
