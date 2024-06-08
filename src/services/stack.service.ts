import { CreateStackData } from '@/models/stack.model';
import { PrismaService } from '@/services/prisma.service';

export class StackService {
  private static _instance: StackService;
  private constructor() {}

  static get get(): StackService {
    return this._instance ?? (this._instance = new StackService());
  }

  async getAllStacks() {
    const prisma = await PrismaService.get();
    return prisma.stack.findMany();
  }

  async createStack(data: CreateStackData) {
    const prisma = await PrismaService.get();
    return prisma.stack.create({ data });
  }
}
