import { Stack as PrismaStack } from '@prisma/client';
import { z } from 'zod';
import { parse } from 'yaml';
import { config } from 'docker-compose';

export const CreateStackSchema = z.object({
  name: z.string(),
  code: z
    .string()
    .refine(
      code => {
        try {
          return parse(code);
        } catch {
          return false;
        }
      },
      {
        message: 'Code must be a valid YAML string.',
      },
    )
    .superRefine(async (code, ctx) => {
      const result = await config({ configAsString: code }).catch(e => e);
      if (result?.exitCode && result?.err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid Docker Compose configuration: "${result?.err?.replace('validating -: ', '').trim()}"`,
        });
      }
    }),
  cwd: z.string().optional().nullable(),
  notes: z.string().optional().nullable().default(''),
});

export type CreateStackData = z.infer<typeof CreateStackSchema>;

export type Stack = PrismaStack;
