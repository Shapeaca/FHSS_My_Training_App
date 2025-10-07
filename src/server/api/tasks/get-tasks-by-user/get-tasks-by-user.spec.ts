import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, TaskStatus, User } from '../../../../../prisma/client';
import { createTasksDummy } from '../../../dummy/functions/create-tasks';
import { createTasksFromFaker } from '../../../../../utils/task/task';
import { BatchPayload } from '../../../../../prisma/generated/internal/prismaNamespace';

describe('Get tasks by user', () => {
  let requestingUser: User;
  let getTasksByUser: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['getTasksByUser'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
      }),
    });
    getTasksByUser = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .getTasksByUser;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('gets the tasks', async () => {
    const total = 5;
    const page = 3;
    const tasks = await createTasksFromFaker(total, requestingUser.id);

    try {
      const retreivedTasks = await getTasksByUser({
        pageSize: page,
        pageOffset: 0,
      });

      //Total is expected total
      expect(retreivedTasks).toHaveProperty('totalCount', total);

      //data length is expecetd page
      expect(retreivedTasks.data.length).toBe(page);
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: {
            in: tasks.map(task => task.id),
          },
        },
      });
    }
  });

  it('errors on bad pagination', async () => {
    const total = 5;
    const page = 3;
    const tasks = await createTasksFromFaker(total, requestingUser.id);

    let error;
    try {
      await getTasksByUser({ pageSize: page, pageOffset: total }); // attempt to skip all of the items
    } catch (err) {
      error = err;
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: {
            in: tasks.map(task => task.id),
          },
        },
      });
    }

    expect(error).toHaveProperty('code', 'BAD_REQUEST');
  });

  it('returns empty if empty database', async () => {
    const result = await getTasksByUser({ pageSize: 10, pageOffset: 0 });

    expect(result).toHaveProperty('totalCount', 0);
    expect(result.data).length(0);
  });
});
