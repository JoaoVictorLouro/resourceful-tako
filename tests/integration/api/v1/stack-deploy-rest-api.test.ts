import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import * as StackRoute from '@/app/api/v1/stack/route';
import * as SingleDeployRoute from '@/app/api/v1/stack/[stack_id]/deploy/route';
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

    const r = execSync('docker ps --format json', { encoding: 'utf-8' });

    const data = r
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(r => JSON.parse(r));

    const stackContainer = data.find(c => c.Names.includes('sample_without_deps'));

    expect(stackContainer).toBeDefined();
  });
});
