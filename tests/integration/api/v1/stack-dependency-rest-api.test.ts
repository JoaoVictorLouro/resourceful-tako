import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as StackRoute from '@/app/api/v1/stack/route';
import * as StackDependencyRoute from '@/app/api/v1/stack_dependency/route';
import * as SingleStackDependencyRoute from '@/app/api/v1/stack_dependency/[stack_dependency_id]/route';
import { resetState } from '@/tests/utils/reset-state';
import { getSampleComposeFile, SampleComposeFile } from '../../../utils/get-sample-compose-file';
import { mockRequest } from '@/tests/utils/mock-request';
import { getInvalidResponse, getValidResponse } from '@/tests/utils/response';
import { Stack } from '@prisma/client';

describe('Stack Dependecy Deploy REST API', () => {
  let sampleFileWithoutDeps: string = '';
  let sampleFileWithDeps: string = '';

  beforeEach(async () => {
    await resetState();
  });

  beforeAll(async () => {
    const result = await Promise.all([
      getSampleComposeFile(SampleComposeFile.WITHOUT_DEPS),
      getSampleComposeFile(SampleComposeFile.WITH_DEPS),
    ]);
    sampleFileWithoutDeps = result[0];
    sampleFileWithDeps = result[1];
  });

  it('should be able to create a dependency between two stacks', async () => {
    const {
      data: { stack: stackWithoutDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithoutDeps',
            code: sampleFileWithoutDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stack: stackWithDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithDeps',
            code: sampleFileWithDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stackDependency },
    } = await getValidResponse(
      await StackDependencyRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            stack_id: stackWithDeps.id,
            dependent_stack_id: stackWithoutDeps.id,
            notes: 'random notes',
          },
        }),
      ),
    );

    expect(stackDependency.id).toBeDefined();
    expect(stackDependency.stackId).toBe(stackWithDeps.id);
    expect(stackDependency.dependsOnStackId).toBe(stackWithoutDeps.id);
    expect(stackDependency.notes).toBe('random notes');
  });

  it('should not allow circular dependencies', async () => {
    const {
      data: { stack: stackWithoutDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithoutDeps',
            code: sampleFileWithoutDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stack: stackWithDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithDeps',
            code: sampleFileWithDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    await StackDependencyRoute.POST(
      mockRequest({
        method: 'POST',
        body: {
          stack_id: stackWithDeps.id,
          dependent_stack_id: stackWithoutDeps.id,
          notes: 'random notes',
        },
      }),
    );

    const { errors, status, message } = await getInvalidResponse(
      await StackDependencyRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            stack_id: stackWithoutDeps.id,
            dependent_stack_id: stackWithDeps.id,
            notes: 'random notes',
          },
        }),
      ),
    );

    expect(status).toBe(400);
    expect(message).toBe(
      `Stack with ID ${stackWithDeps.id} already depends on stack with ID ${stackWithoutDeps.id}, cyclic dependency detected`,
    );
    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('cyclic_dependency');
    expect(errors[0].message).toBe('Cyclic dependency between dependent stack and owner stack');
  });

  it('should be able to retrieve all stack dependencies', async () => {
    const withoutDepsList: Stack[] = [];
    const withDepsList: Stack[] = [];

    for (let i = 0; i < 5; i++) {
      const {
        data: { stack: stackWithoutDeps },
      } = await getValidResponse(
        await StackRoute.POST(
          mockRequest({
            method: 'POST',
            body: {
              name: `WithoutDeps${i}`,
              code: sampleFileWithoutDeps,
              cwd: '/tmp',
              notes: 'random notes',
            },
          }),
        ),
      );
      withoutDepsList.push(stackWithoutDeps);

      const {
        data: { stack: stackWithDeps },
      } = await getValidResponse(
        await StackRoute.POST(
          mockRequest({
            method: 'POST',
            body: {
              name: `WithDeps${i}`,
              code: sampleFileWithDeps,
              cwd: '/tmp',
              notes: 'random notes',
            },
          }),
        ),
      );
      withDepsList.push(stackWithDeps);

      await getValidResponse(
        await StackDependencyRoute.POST(
          mockRequest({
            method: 'POST',
            body: {
              stack_id: stackWithDeps.id,
              dependent_stack_id: stackWithoutDeps.id,
              notes: `random notes ${i}`,
            },
          }),
        ),
      );
    }

    const {
      data: { stackDependencies },
    } = await getValidResponse(await StackDependencyRoute.GET());

    expect(Array.isArray(stackDependencies)).toBeTruthy();
    expect(stackDependencies.length).toBe(5);

    for (let i = 0; i < 5; i++) {
      const stackDependency = stackDependencies[i];
      expect(stackDependency.id).toBeDefined();
      expect(stackDependency.stackId).toBe(withDepsList[i].id);
      expect(stackDependency.dependsOnStackId).toBe(withoutDepsList[i].id);
      expect(stackDependency.notes).toBe(`random notes ${i}`);
    }
  });

  it('should be able to retrieve a single stack dependency', async () => {
    const {
      data: { stack: stackWithoutDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithoutDeps',
            code: sampleFileWithoutDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stack: stackWithDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithDeps',
            code: sampleFileWithDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: {
        stackDependency: { id: stackDependencyID },
      },
    } = await getValidResponse(
      await StackDependencyRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            stack_id: stackWithDeps.id,
            dependent_stack_id: stackWithoutDeps.id,
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stackDependency },
    } = await getValidResponse(
      await SingleStackDependencyRoute.GET(mockRequest({ method: 'GET' }), {
        params: { stack_dependency_id: stackDependencyID },
      }),
    );

    expect(stackDependency.id).toBeDefined();
    expect(stackDependency.stackId).toBe(stackWithDeps.id);
    expect(stackDependency.dependsOnStackId).toBe(stackWithoutDeps.id);
    expect(stackDependency.notes).toBe('random notes');
  });

  it('should be able to delete a single stack dependency', async () => {
    const {
      data: { stack: stackWithoutDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithoutDeps',
            code: sampleFileWithoutDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stack: stackWithDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithDeps',
            code: sampleFileWithDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: {
        stackDependency: { id: stackDependencyID },
      },
    } = await getValidResponse(
      await StackDependencyRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            stack_id: stackWithDeps.id,
            dependent_stack_id: stackWithoutDeps.id,
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stackDependency },
    } = await getValidResponse(
      await SingleStackDependencyRoute.GET(mockRequest({ method: 'GET' }), {
        params: { stack_dependency_id: stackDependencyID },
      }),
    );

    expect(stackDependency.id).toBeDefined();

    await getValidResponse(
      await SingleStackDependencyRoute.DELETE(mockRequest({ method: 'DELETE' }), {
        params: { stack_dependency_id: stackDependencyID },
      }),
    );

    const { status, errors } = await getInvalidResponse(
      await SingleStackDependencyRoute.GET(mockRequest({ method: 'GET' }), {
        params: { stack_dependency_id: stackDependencyID },
      }),
    );

    expect(status).toBe(404);
    expect(errors).toBeDefined();
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('not_found');
  });

  it('should be able to update a stack dependency', async () => {
    const {
      data: { stack: stackWithoutDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithoutDeps',
            code: sampleFileWithoutDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stack: stackWithDeps },
    } = await getValidResponse(
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: 'WithDeps',
            code: sampleFileWithDeps,
            cwd: '/tmp',
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: {
        stackDependency: { id: stackDependencyID },
      },
    } = await getValidResponse(
      await StackDependencyRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            stack_id: stackWithDeps.id,
            dependent_stack_id: stackWithoutDeps.id,
            notes: 'random notes',
          },
        }),
      ),
    );

    const {
      data: { stackDependency },
    } = await getValidResponse(
      await SingleStackDependencyRoute.PATCH(
        mockRequest({
          method: 'PATCH',
          body: {
            notes: 'updated notes',
          },
        }),
        { params: { stack_dependency_id: stackDependencyID } },
      ),
    );

    expect(stackDependency.id).toBeDefined();
    expect(stackDependency.stackId).toBe(stackWithDeps.id);
    expect(stackDependency.dependsOnStackId).toBe(stackWithoutDeps.id);
    expect(stackDependency.notes).toBe('updated notes');
  });
});
