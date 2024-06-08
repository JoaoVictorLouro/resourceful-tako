import { CreateStackSchema } from '@/models/stack.model';
import { StackService } from '@/services/stack.service';
import { PrismaClient } from '@prisma/client';

// ADD STACK
export async function POST(request: Request) {
  const data = CreateStackSchema.parse(await request.json());
  const createdStack = await StackService.get.createStack(data);

  return {
    stack: createdStack,
  };
}
