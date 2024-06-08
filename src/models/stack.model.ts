import { Stack as PrismaStack } from '@prisma/client';
import { z } from 'zod';

export const CreateStackSchema = z.object({
  name: z.string(),
  code: z.string(),
  notes: z.string().optional().default(''),
});

export type CreateStackData = z.infer<typeof CreateStackSchema>;

export type Stack = PrismaStack;
