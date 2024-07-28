import { CreateStackData } from '@/models/stack.model';
import { PrismaService } from '@/services/prisma.service';
import { ErrorTranslatableToResponse } from '@/util/api/error-translatable-as-response';
import { InvalidRequestErrorResponse } from '@/util/api/get-validated-request-data';
import { Stack, StackDependency } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { config, upAll, down, ps } from 'docker-compose';
import { NextResponse } from 'next/server';
import Yaml from 'yaml';

interface StackDependencyTree {
  stackId: string;
  dependencies: StackDependencyTree[];
  allDependencies: Set<string>;
}

interface StackDependentTree {
  stackId: string;
  dependents: StackDependentTree[];
  allDependents: Set<string>;
}

export class StackNotFoundError extends ErrorTranslatableToResponse {
  readonly stackId: string;
  constructor(stackId: string) {
    super(`Stack ID ${stackId} not found`);
    this.stackId = stackId;
  }

  asResponse(): InvalidRequestErrorResponse {
    return NextResponse.json(
      {
        status: 404,
        message: this.message,
        errors: [{ code: 'not_found', message: 'Stack not found' }],
      },
      { status: 404 },
    );
  }
}

export class StackDependencyNotFoundError extends ErrorTranslatableToResponse {
  readonly stackDependencyId: string;
  constructor(stackDependencyId: string) {
    super(`StackDependency ID ${stackDependencyId} not found`);
    this.stackDependencyId = stackDependencyId;
  }

  asResponse(): InvalidRequestErrorResponse {
    return NextResponse.json(
      {
        status: 404,
        message: this.message,
        errors: [{ code: 'not_found', message: 'StackDependency not found' }],
      },
      { status: 404 },
    );
  }
}

export class StackDependencyConfigurationError extends ErrorTranslatableToResponse {
  readonly stackDependencyId: string;
  constructor(stackDependencyId: string, message: string) {
    super(`StackDependency ID ${stackDependencyId} misconfiguration: ${message}`);
    this.stackDependencyId = stackDependencyId;
  }

  asResponse(): InvalidRequestErrorResponse {
    return NextResponse.json(
      {
        status: 400,
        message: this.message,
        errors: [{ code: 'bad_request', message: 'StackDependency misconfiguration' }],
      },
      { status: 400 },
    );
  }
}

export class DependencyCycleDetectedError extends ErrorTranslatableToResponse {
  readonly stackId: string;
  readonly dependentStackId: string;
  constructor(stackId: string, dependentStackId: string) {
    super(`Dependen ${stackId} not found`);
    this.stackId = stackId;
    this.dependentStackId = dependentStackId;
  }

  asResponse(): InvalidRequestErrorResponse {
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

export const MANAGED_CONTAINER_LABEL = 'resourceful-tako-managed';

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

  async getAllStackDependencies() {
    const prisma = await PrismaService.get();
    return prisma.stackDependency.findMany();
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

  async getStackDependencyById(id: string) {
    const prisma = await PrismaService.get();
    const result = await prisma.stackDependency.findUnique({ where: { id } });
    if (!result) {
      throw new StackDependencyNotFoundError(id);
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

  async deleteStackDependencyById(id: string) {
    const prisma = await PrismaService.get();
    try {
      await prisma.stackDependency.delete({ where: { id } });
    } catch (e) {
      if ((e as PrismaClientKnownRequestError)?.code === 'P2025') {
        throw new StackDependencyNotFoundError(id);
      }
      throw e;
    }
  }

  async updateStack(stack: Stack) {
    const prisma = await PrismaService.get();
    return prisma.stack.update({ where: { id: stack.id }, data: stack });
  }

  async updateStackDependency(stackDependency: StackDependency) {
    const prisma = await PrismaService.get();
    return prisma.stackDependency.update({ where: { id: stackDependency.id }, data: stackDependency });
  }

  private async addMetadataToComposeString(composeContents: string, cwd: string | undefined | null): Promise<string> {
    const { data } = await config({ configAsString: composeContents, cwd: cwd || undefined }).catch(() => {
      return config({ configAsString: composeContents });
    });

    Object.values(data.config.services).forEach(_service => {
      const service = _service as Record<string, unknown>;
      service.labels = service.labels || [];
      if (Array.isArray(service.labels)) {
        service.labels = service.labels.filter((label: string) => label !== MANAGED_CONTAINER_LABEL);
      }
    });

    return Yaml.stringify(data.config);
  }

  async teardownStack(stackId: string) {
    const dependentsTree = await this.getDependentsTree(stackId);
    for (const dependentId of dependentsTree.dependents.map(r => r.stackId)) {
      await this.teardownStack(dependentId);
    }

    const stack = await this.getStackById(stackId);

    const config = await this.addMetadataToComposeString(stack.code, stack.cwd);

    try {
      const result = await down({
        cwd: stack.cwd || undefined,
        configAsString: config,
        log: true,
      });

      return {
        result,
        stack,
      };
    } catch (e) {
      console.error(e);
      return {
        stack,
        error: e,
      };
    }
  }

  async tearDownAllStacks() {
    const stacks = await this.getAllStacks();
    for (const stack of stacks) {
      await this.teardownStack(stack.id);
    }
  }

  async getStackStatus(stackId: string) {
    const stack = await this.getStackById(stackId);
    const config = await this.addMetadataToComposeString(stack.code, stack.cwd);

    const isRunning = await ps({
      configAsString: config,
      cwd: stack.cwd || undefined,
    });

    if (!isRunning) {
      return {
        allGreen: false,
        deployed: false,
        services: {},
      };
    }

    const { err, out: outString } = await ps({
      configAsString: config,
      cwd: stack.cwd || undefined,
      commandOptions: ['--format', 'json'],
    });

    const servicesStatus: {
      ID: string;
      Name: string;
      Service: string;
      State: string;
      ExitCode: number;
      Status: string;
      Image: string;
    }[] = outString
      .trim()
      .split('\n')
      .map(r => JSON.parse(r.trim()));

    if (err) {
      throw err;
    }

    return {
      allGreen: servicesStatus.every(s => s['State'] === 'running' && s['ExitCode'] === 0),
      deployed: true,
      services: Object.fromEntries(
        servicesStatus.map(r => {
          return [r.Service, { state: r.State, exitCode: r.ExitCode, status: r.Status, containerName: r.Name, containerID: r.ID }];
        }),
      ),
    };
  }

  async deployStack(stackId: string) {
    const dependentsTree = await this.getDependentsTree(stackId);
    for (const dependentId of dependentsTree.dependents.map(r => r.stackId)) {
      await this.teardownStack(dependentId);
    }

    const stack = await this.getStackById(stackId);

    try {
      const config = await this.addMetadataToComposeString(stack.code, stack.cwd);

      const result = await upAll({
        cwd: stack.cwd || undefined,
        configAsString: config,
      });

      const status = await this.getStackStatus(stackId);

      if (status.deployed && !status.allGreen) {
        throw new Error('Some services are not running');
      }

      for (const dependentId of dependentsTree.dependents.map(r => r.stackId)) {
        await this.deployStack(dependentId);
      }

      return {
        result,
        stack,
      };
    } catch (e) {
      await this.teardownStack(stackId);
      throw e;
    }
  }

  async getDependencyTree(stackId: string): Promise<StackDependencyTree> {
    const prisma = await PrismaService.get();
    const stack = await prisma.stack.findUnique({ where: { id: stackId }, include: { dependencies: true } });

    if (!stack) {
      throw new StackDependencyNotFoundError(stackId);
    }

    const dependencies = await Promise.all(stack.dependencies.map(dependency => this.getDependencyTree(dependency.id)));

    const allDependencies = new Set<string>();

    for (const dependency of dependencies) {
      allDependencies.add(dependency.stackId);
      dependency.allDependencies.forEach(subDependency => allDependencies.add(subDependency));
    }

    return {
      stackId,
      dependencies,
      allDependencies,
    };
  }

  async getDependentsTree(stackId: string): Promise<StackDependentTree> {
    const prisma = await PrismaService.get();

    if ((await prisma.stack.findUnique({ where: { id: stackId } })) === null) {
      throw new StackNotFoundError(stackId);
    }

    const directDependents = await prisma.stackDependency.findMany({ where: { dependsOnStackId: stackId } });

    const dependents = await Promise.all(directDependents.map(dependent => this.getDependentsTree(dependent.stackId)));

    const allDependents = new Set<string>();

    for (const dependent of dependents) {
      allDependents.add(dependent.stackId);
      dependent.allDependents.forEach(subDependent => allDependents.add(subDependent));
    }

    return {
      stackId,
      dependents,
      allDependents,
    };
  }

  async addStackDependency(stackId: string, dependentStackId: string, notes: string = '') {
    try {
      if (stackId === dependentStackId) {
        throw new StackDependencyConfigurationError(stackId, `Stack cannot depend on itself: Stack ID ${dependentStackId}`);
      }

      const dependentStackDependencyTree = await this.getDependencyTree(dependentStackId);
      if (dependentStackDependencyTree.allDependencies.has(stackId)) {
        throw new DependencyCycleDetectedError(stackId, dependentStackId);
      }

      const stackDependencyTree = await this.getDependencyTree(stackId);
      if (stackDependencyTree.dependencies.map(d => d.stackId).includes(dependentStackId)) {
        throw new StackDependencyConfigurationError(stackId, `Dependency already exists: Stack ID ${dependentStackId}`);
      }

      const prisma = await PrismaService.get();
      return prisma.stackDependency.create({
        data: {
          dependsOnStackId: dependentStackId,
          stackId,
          notes,
        },
      });
    } catch (e) {
      if ((e as PrismaClientKnownRequestError)?.code === 'P2025') {
        throw new StackNotFoundError(stackId);
      }
      throw e;
    }
  }
}
