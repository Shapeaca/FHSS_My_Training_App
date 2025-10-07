import { faker } from '@faker-js/faker';
import { prisma, TaskStatus } from '../../prisma/client';

export async function createTasksFromFaker(count: number, userId: string) {
  return await prisma.task.createManyAndReturn({
    data: Array.from({ length: count }, () => ({
      updatedDate: faker.date.recent(),
      createdDate: faker.date.past(),
      title: faker.book.title(),
      description: faker.hacker.phrase(),
      dueDate: faker.date.soon({ days: 10 }),
      status: faker.helpers.enumValue(TaskStatus),
      // status: TaskStatus.INCOMPLETE,
      completedDate: faker.date.recent(),
      ownerId: userId,
    })),
  });
}
