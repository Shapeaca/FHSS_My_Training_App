import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, TaskStatus, User } from '../../../../../prisma/client';
import { createTasksFromFaker } from '../../../../../utils/task/task';
import { z } from 'zod/v4';
import { catchError } from 'rxjs';

describe('Update task', () => {
  let requestingUser: User;
  let otherUser: User;
  let updateTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['updateTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
      }),
    });
    updateTask = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .updateTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('it updates the task when set to complete', async () => {
    const task = await prisma.task.create({
      data: {
        ownerId: requestingUser.id,
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        status: 'INCOMPLETE',
        completedDate: faker.date.recent(),
        updatedDate: faker.date.recent(),
        createdDate: faker.date.past(),
      },
    });

    try {
      const title = faker.book.title();
      const description = faker.commerce.productDescription();
      const status: TaskStatus = 'COMPLETE';

      const updatedTask = await updateTask({
        id: task.id,
        title: title,
        description: description,
        status: status,
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe(title);
      expect(updatedTask.description).toBe(description);
      expect(updatedTask.status).toBe(status);
      expect(updatedTask.completedDate).toBeInstanceOf(Date);
    } finally {
      await prisma.task.delete({ where: { id: task.id } });
    }
  });

  it('updates the task when taken off complete', async () => {
    const task = await prisma.task.create({
      data: {
        ownerId: requestingUser.id,
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        status: 'COMPLETE',
        completedDate: faker.date.recent(),
        updatedDate: faker.date.recent(),
        createdDate: faker.date.past(),
      },
    });

    try {
      const title = faker.book.title();
      const description = faker.commerce.productDescription();
      const status: TaskStatus = 'INCOMPLETE';

      const updatedTask = await updateTask({
        id: task.id,
        title: title,
        description: description,
        status: status,
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask.title).toBe(title);
      expect(updatedTask.description).toBe(description);
      expect(updatedTask.status).toBe(status);
      expect(updatedTask.completedDate).toBeNull();
    } finally {
      await prisma.task.delete({ where: { id: task.id } });
    }
  });

  it('errors if the task is not found', async () => {
    let error;

    try {
      await updateTask({ id: faker.string.uuid() });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });
});
