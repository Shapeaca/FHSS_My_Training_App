import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { TaskStatus } from '../../../../../prisma/generated/enums';
import { isPrismaError } from '../../../utils/prisma';

const updateTaskInput = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.date().nullable(),
  status: z.literal(Object.values(TaskStatus)),
});

const updateTaskOutput = z.void();

export const updateTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(updateTaskInput)
  .output(updateTaskOutput)
  .mutation(async opts => {
    // Your logic goes here
    try {
      const foundTask = await prisma.task.findUniqueOrThrow({
        where: {
          id: opts.input.id,
          ownerId: opts.ctx.userId,
        },
      });

      //check if the same

      //check if status is completed
      let nwCompletedDate;
      if (opts.input.status == foundTask.status) {
        //stays the same
        nwCompletedDate = foundTask.dueDate;
      } else {
        //changes
        if (opts.input.status == TaskStatus.COMPLETE) {
          //Changes to complete
          nwCompletedDate = new Date(Date.now());
        } else {
          //Changes from complete to something else
          nwCompletedDate = null;
        }
      }

      //finally updating
      await prisma.task.update({
        where: {
          id: opts.input.id,
        },
        data: {
          title: opts.input.title,
          description: opts.input.description,
          dueDate: opts.input.dueDate,
          status: opts.input.status,
          completedDate: nwCompletedDate,
        },
      });
    } catch (error) {
      if (isPrismaError(error, 'NOT_FOUND')) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      throw error;
    }
  });
