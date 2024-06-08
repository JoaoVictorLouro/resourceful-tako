import { CreateStackSchema } from '@/models/stack.model';
import { StackService } from '@/services/stack.service';

export async function POST(request: Request) {
  const data = CreateStackSchema.parse(await request.json());
  const createdStack = await StackService.get.createStack(data);

  return new Response(JSON.stringify({ stack: createdStack }));
}
