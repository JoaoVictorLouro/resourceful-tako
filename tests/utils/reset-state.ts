import { PrismaService } from '@/services/prisma.service';
import { StackService } from '@/services/stack.service';

export async function resetState() {
  try {
    await StackService.get.tearDownAllStacks();
    const prismaService = await PrismaService.get();
    await prismaService.stackDependency.deleteMany();
    await prismaService.stack.deleteMany();
  } catch (e) {
    console.error('Error resetting state', e);
    throw e;
  }
}
