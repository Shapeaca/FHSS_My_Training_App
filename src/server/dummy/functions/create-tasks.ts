import { makeDummy } from '@fhss-web-team/backend-utils';
import z from 'zod/v4';
import { prisma } from '../../../../prisma/client';
import { createTasksFromFaker } from '../../../../utils/task/task';

export const createTasksDummy = makeDummy({
  name: 'Create tasks',
  description: 'This Creates tasks',
  inputSchema: z.object({ count: z.number().default(10), netId: z.string() }),

  handler: async data => {
    console.log(data);
    const user = await prisma.user.findUnique({ where: { netId: data.netId } });
    if (!user) {
      throw new Error('User not found');
    }

    const { length } = await createTasksFromFaker(data.count, user.id);
    return `Created ${length} tasks`;
  },
});
