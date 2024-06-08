import { PrismaClient } from '@prisma/client';

class PrismaServiceSingleton {
  private static _instance: PrismaServiceSingleton;
  prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  private async connect() {
    await this.prisma.$connect();
    return this.prisma;
  }

  static async get(): Promise<PrismaClient> {
    return this._instance ? this._instance.prisma : await (this._instance = new PrismaServiceSingleton()).connect();
  }
}

declare const globalThis: {
  PrismaService: typeof PrismaServiceSingleton;
} & typeof global;

export const PrismaService =
  process.env.NODE_ENV !== 'production'
    ? globalThis.PrismaService ?? ((globalThis.PrismaService = PrismaServiceSingleton), PrismaServiceSingleton)
    : PrismaServiceSingleton;
