import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as StackRoute from '@/app/api/v1/stack/route';
import * as SingleStackRoute from '@/app/api/v1/stack/[stack_id]/route';
import { resetState } from '@/tests/utils/reset-state';
import { getSampleComposeFile, SampleComposeFile } from '../../../utils/get-sample-compose-file';
import { mockRequest } from '@/tests/utils/mock-request';
import { getValidResponse } from '@/tests/utils/response';

describe('Stack REST API', () => {
  let sampleFileWithoutDeps: string = '';
  let sampleFileWithDeps: string = '';

  beforeAll(async () => {
    const result = await Promise.all([
      getSampleComposeFile(SampleComposeFile.WITHOUT_DEPS),
      getSampleComposeFile(SampleComposeFile.WITH_DEPS),
    ]);
    sampleFileWithoutDeps = result[0];
    sampleFileWithDeps = result[1];
  });

  beforeEach(async () => {
    await resetState();
  });

  it('should be able to create new stacks', async () => {
    const currentDate = Date.now();

    const response = await StackRoute.POST(
      mockRequest({
        method: 'POST',
        body: {
          name: 'WithoutDeps',
          code: sampleFileWithoutDeps,
          cwd: '/tmp',
          notes: 'random notes',
        },
      }),
    );

    expect(response.status).toBe(201);

    const {
      data: { stack },
    } = await getValidResponse(response);

    expect(stack.id).toBeDefined();
    expect(stack.name).toBe('WithoutDeps');
    expect(stack.notes).toBe('random notes');
    expect(stack.cwd).toBe('/tmp');

    expect(new Date(stack.createdAt).getTime()).toBeGreaterThanOrEqual(currentDate);
    expect(new Date(stack.updatedAt).getTime()).toBeGreaterThanOrEqual(currentDate);
  });

  it('should be able to retrieve all stacks', async () => {
    const {
      data: { stacks: stackListBeforeCreation },
    } = await getValidResponse(await StackRoute.GET(mockRequest({ method: 'GET' })));

    expect(Array.isArray(stackListBeforeCreation)).toBeTruthy();
    expect(stackListBeforeCreation.length).toBe(0);

    for (let i = 0; i < 5; i++) {
      await StackRoute.POST(
        mockRequest({
          method: 'POST',
          body: {
            name: `Stack-${i}`,
            code: sampleFileWithoutDeps,
            cwd: `/tmp`,
            notes: `random notes ${i}`,
          },
        }),
      );
    }

    const {
      data: { stacks: stackListAfterCreation },
    } = await getValidResponse(await StackRoute.GET(mockRequest({ method: 'GET' })));

    expect(Array.isArray(stackListAfterCreation)).toBeTruthy();
    expect(stackListAfterCreation.length).toBe(5);

    for (let i = 0; i < 5; i++) {
      const stack = stackListAfterCreation[i];
      expect(stack.id).toBeDefined();
      expect(stack.name).toBe(`Stack-${i}`);
      expect(stack.notes).toBe(`random notes ${i}`);
      expect(stack.cwd).toBe(`/tmp`);
    }
  });

  it('should be able to retrieve a single stack', async () => {
    const response = await StackRoute.POST(
      mockRequest({
        method: 'POST',
        body: {
          name: 'SingleStack',
          code: sampleFileWithoutDeps,
          cwd: '/tmp',
          notes: 'random notes',
        },
      }),
    );

    const {
      data: { stack: createdStack },
    } = await getValidResponse(response);

    const {
      data: { stack: retrievedStack },
    } = await getValidResponse(
      await SingleStackRoute.GET(
        mockRequest({
          method: 'GET',
          path: `/api/v1/stack/${createdStack.id}`,
        }),
        { params: { stack_id: createdStack.id } },
      ),
    );

    expect(retrievedStack.id).toBe(createdStack.id);
    expect(retrievedStack.name).toBe(createdStack.name);
    expect(retrievedStack.notes).toBe(createdStack.notes);
    expect(retrievedStack.cwd).toBe(createdStack.cwd);
  });

  it('should be able to update a single stack', async () => {
    // create two stacks:
    await StackRoute.POST(
      mockRequest({
        method: 'POST',
        body: {
          name: 'UnchangedStack',
          code: sampleFileWithoutDeps,
        },
      }),
    );

    const response = await StackRoute.POST(
      mockRequest({
        method: 'POST',
        body: {
          name: 'ChangedStack',
          code: sampleFileWithoutDeps,
        },
      }),
    );

    const {
      data: { stack: createdStack },
    } = await getValidResponse(response);

    // update the stack
    const updateResponse = await SingleStackRoute.PATCH(
      mockRequest({
        method: 'PATCH',
        body: { name: 'ChangedStack 2', notes: 'new notes', cwd: '/tmp', code: sampleFileWithDeps.replace('Sample', 'CHANGED_SAMPLE') },
      }),
      {
        params: { stack_id: createdStack.id },
      },
    );

    const {
      data: { stack: updatedStack },
    } = await getValidResponse(updateResponse);

    expect(updatedStack.id).toBe(createdStack.id);
    expect(updatedStack.name).toBe('ChangedStack 2');
    expect(updatedStack.notes).toBe('new notes');
    expect(updatedStack.cwd).toBe('/tmp');
    expect(updatedStack.code).toBe(sampleFileWithDeps.replace('Sample', 'CHANGED_SAMPLE'));
  });

  it('should be able to delete a single stack', async () => {
    const response = await StackRoute.POST(
      mockRequest({
        method: 'POST',
        body: {
          name: 'StackToDelete',
          code: sampleFileWithoutDeps,
        },
      }),
    );

    const {
      data: { stack: createdStack },
    } = await getValidResponse(response);

    const deleteResponse = await SingleStackRoute.DELETE(
      mockRequest({
        method: 'DELETE',
      }),
      { params: { stack_id: createdStack.id } },
    );

    expect(deleteResponse.ok).toBeTruthy();

    const {
      data: { stacks: stackListAfterDeletion },
    } = await getValidResponse(await StackRoute.GET(mockRequest({ method: 'GET' })));

    expect(Array.isArray(stackListAfterDeletion)).toBeTruthy();
    expect(stackListAfterDeletion.length).toBe(0);
  });
});
