import { CreateStackData } from '@/models/stack.model';
import { PrismaService } from '@/services/prisma.service';
import { config, upAll } from 'docker-compose';
import { NextResponse } from 'next/server';

export class StackNotFoundError extends Error {
  readonly stackId: string;
  constructor(stackId: string) {
    super(`Stack ID ${stackId} not found`);
    this.stackId = stackId;
  }

  asResponse() {
    return new NextResponse(JSON.stringify({ status: 404, error: 'Stack not found' }), { status: 404 });
  }
}

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
    const c = await config({ configAsString: data.code });
    console.log({ c });
    const prisma = await PrismaService.get();
    return prisma.stack.create({ data });
  }

  async getStackById(id: string) {
    const prisma = await PrismaService.get();
    const result = await prisma.stack.findUnique({ where: { id } });
    if (!result) {
      throw new StackNotFoundError(id);
    }

    return result;
  }

  async deployStack(id: string) {
    const stack = await this.getStackById(id);

    await config({ configAsString: stack.code });

    console.log({ stack: stack.code });

    const result = await upAll({
      cwd: stack.cwd || undefined,
      configAsString: stack.code,
    });

    return {
      result,
      stack,
    };
  }
}
