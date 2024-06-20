import { CreateStackData } from '@/models/stack.model';
import { PrismaService } from '@/services/prisma.service';
import { Stack } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { config, upAll } from 'docker-compose';
import { NextResponse } from 'next/server';

export class StackNotFoundError extends Error {
  readonly stackId: string;
  constructor(stackId: string) {
    super(`Stack ID ${stackId} not found`);
    this.stackId = stackId;
  }

  asResponse() {
    return new NextResponse(
      JSON.stringify({
        status: 404,
        message: `Stack with ID ${this.stackId} not found`,
        errors: [{ code: 'not_found', message: 'Stack not found' }],
      }),
      { status: 404 },
    );
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

  async deleteStackById(id: string) {
    const prisma = await PrismaService.get();
    try {
      await prisma.stack.delete({ where: { id } });
    } catch (e) {
      if ((e as PrismaClientKnownRequestError)?.code === 'P2025') {
        throw new StackNotFoundError(id);
      }
      throw e;
    }
  }

  async saveStack(stack: Stack) {
    const prisma = await PrismaService.get();
    return prisma.stack.update({ where: { id: stack.id }, data: stack });
  }

  async deployStack(id: string) {
    const stack = await this.getStackById(id);

    await config({ configAsString: stack.code });

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
