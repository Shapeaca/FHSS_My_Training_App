import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { TaskStatus } from '../../../../../prisma/generated/enums';
import { isPrismaError } from '../../../utils/prisma';

const updateTaskInput = z.object({
  id: z.string(),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  dueDate: z.optional(z.date()),
  status: z.optional(z.literal(Object.values(TaskStatus))),
});

const updateTaskOutput = z.object({
  status: z.literal(Object.values(TaskStatus)),
  id: z.string(),
  createdDate: z.date(),
  updatedDate: z.date().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  completedDate: z.nullable(z.date()),
  ownerId: z.string(),
});

export const updateTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(updateTaskInput)
  .output(updateTaskOutput)
  .mutation(async opts => {
    const oldTask = await prisma.task.findUnique({
      where: { id: opts.input.id, ownerId: opts.ctx.userId },
    });
    if (!oldTask) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }

    //calculate completedAt date based on status changes
    let calculatedCompletedAt: Date | null = oldTask.completedDate;
    if (opts.input.status) {
      if (opts.input.status != oldTask.status) {
        //if we just switched the task to complete
        if (opts.input.status === 'COMPLETE') {
          calculatedCompletedAt = new Date();
        }
        //if we just switched the task off complete
        else if (oldTask.status === 'COMPLETE') {
          calculatedCompletedAt = null;
        }
      }
    }

    try {
      return await prisma.task.update({
        where: {
          id: oldTask.id,
          ownerId: opts.ctx.userId,
        },
        data: {
          title: opts.input.title?.trim(),
          description: opts.input.description,
          status: opts.input.status,
          completedDate: calculatedCompletedAt,
        },
      });
    } catch (error) {
      if (isPrismaError(error, 'NOT_FOUND')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `failed to update task: ${oldTask.id} under user: ${opts.ctx.user.netId}`,
        });
      }
      throw error;
    }
  });
