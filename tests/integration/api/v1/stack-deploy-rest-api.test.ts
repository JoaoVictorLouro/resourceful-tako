import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import * as StackRoute from '@/app/api/v1/stack/route';
import * as SingleDeployRoute from '@/app/api/v1/stack/[stack_id]/deploy/route';
import * as StackDependencyRoute from '@/app/api/v1/stack_dependency/route';
import { resetState } from '@/tests/utils/reset-state';
import { getSampleComposeFile, SampleComposeFile } from '../../../utils/get-sample-compose-file';
import { mockRequest } from '@/tests/utils/mock-request';
import { getValidResponse } from '@/tests/utils/response';
import { execSync } from 'child_process';

describe('Stack Deploy REST API', () => {
  beforeEach(async () => {
    await resetState();
  });

  afterAll(async () => {
    await resetState();
  });

  const isContainerRunning = (containerName: string) => {
    const r = execSync('docker ps --format json', { encoding: 'utf-8' });

    const data = r
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(r => JSON.parse(r));

    return data.some(c => c.Names.includes(containerName));
  };

  it('should be able to deploy new stacks', async () => {
    const sampleFileWithoutDeps = await getSampleComposeFile(SampleComposeFile.WITHOUT_DEPS);

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

    const deployResponse = await SingleDeployRoute.POST(
      mockRequest({
        method: 'POST',
        body: {},
      }),
      { params: { stack_id: stack.id } },
    );

    expect(deployResponse.ok).toBeTruthy();

    expect(isContainerRunning('sample_without_deps')).toBeTruthy();
  });

  it('should be able to deploy stacks with dependencies', async () => {
    const sampleFileWithoutDeps = await getSampleComposeFile(SampleComposeFile.WITHOUT_DEPS);
    const sampleFileWithDeps = await getSampleComposeFile(SampleComposeFile.WITH_DEPS);

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
            notes: 'random notes',
          },
        }),
      ),
    );

    await SingleDeployRoute.POST(
      mockRequest({
        method: 'POST',
        body: {},
      }),
      { params: { stack_id: stackWithoutDeps.id } },
    );

    expect(isContainerRunning('sample_without_deps')).toBeTruthy();

    await getValidResponse(
      await StackDependencyRoute.POST(
        mockRequest({ method: 'POST', body: { stack_id: stackWithDeps.id, dependent_stack_id: stackWithoutDeps.id } }),
      ),
    );

    await getValidResponse(
      await SingleDeployRoute.POST(
        mockRequest({
          method: 'POST',
          body: {},
        }),
        { params: { stack_id: stackWithDeps.id } },
      ),
    );
    expect(isContainerRunning('sample_with_deps')).toBeTruthy();
  });

  it('should be able to deploy stacks with dependencies - without the dependency being deployed', async () => {
    const sampleFileWithoutDeps = await getSampleComposeFile(SampleComposeFile.WITHOUT_DEPS);
    const sampleFileWithDeps = await getSampleComposeFile(SampleComposeFile.WITH_DEPS);

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
            notes: 'random notes',
          },
        }),
      ),
    );

    expect(isContainerRunning('sample_without_deps')).toBeFalsy();

    await getValidResponse(
      await StackDependencyRoute.POST(
        mockRequest({ method: 'POST', body: { stack_id: stackWithDeps.id, dependent_stack_id: stackWithoutDeps.id } }),
      ),
    );

    await getValidResponse(
      await SingleDeployRoute.POST(
        mockRequest({
          method: 'POST',
          body: {},
        }),
        { params: { stack_id: stackWithDeps.id } },
      ),
    );
    expect(isContainerRunning('sample_with_deps')).toBeTruthy();
  });
});
