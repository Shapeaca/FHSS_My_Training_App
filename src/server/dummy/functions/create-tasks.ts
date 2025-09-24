import { makeDummy } from '@fhss-web-team/backend-utils';
import z from 'zod/v4';
import { Prisma, prisma } from '../../../../prisma/client';
import { faker } from '@faker-js/faker';

export const createTasks = makeDummy({
  name: 'Create tasks',
  description: 'This Creates tasks',
  inputSchema: z.object({ count: z.number().default(10), netId: z.string() }),

  handler: async data => {
    console.log(data);
    const user = await prisma.user.findUnique({ where: { netId: data.netId } });
    if (!user) {
      throw new Error('User not found');
    }

    const tasks: Prisma.TaskCreateManyInput[] = Array.from(
      { length: data.count },
      () => ({
        title: faker.book.title(),
        description: faker.lorem.sentences({ min: 0, max: 3 }),
        ownerId: user.id,
      })
    );

    const { count } = await prisma.task.createMany({ data: tasks });
    return `Created ${count} tasks`;
  },
});
