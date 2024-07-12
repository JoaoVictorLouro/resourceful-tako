import { StackDependency as PrismaStackDependency } from '@prisma/client';
import { z } from 'zod';

export const CreateStackDependencySchema = z.object({
  stack_id: z.string(),
  dependent_stack_id: z.string(),
  notes: z.string().optional().default(''),
});

export type CreateStackDependencyData = z.infer<typeof CreateStackDependencySchema>;

export type StackDependency = PrismaStackDependency;
