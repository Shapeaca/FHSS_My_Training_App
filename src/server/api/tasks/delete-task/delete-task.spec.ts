import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';
import { z } from 'zod/v4';
import { createTasksFromFaker } from '../../../../../utils/task/task';
import { TaskScalarFieldEnum } from '../../../../../prisma/generated/internal/prismaNamespace';

describe('Delete task', () => {
  let requestingUser: User;
  let otherUser: User;
  let deleteTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['deleteTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
      }),
    });
    otherUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
      }),
    });
    deleteTask = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .deleteTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  it('deletes the task', async () => {
    const taskList = await createTasksFromFaker(1, requestingUser.id);
    const task = taskList[0];

    // let databaseTask;
    try {
      await deleteTask({ id: task.id });

      const databaseTask = await prisma.task.findUnique({
        where: {
          id: task.id,
        },
      });

      expect(databaseTask).toBeNull();
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.map(task => task.id),
          },
        },
      });
    }
  });

  it('throws when the task does not exist', async () => {
    const id = faker.database.mongodbObjectId();

    let error;
    try {
      await deleteTask({ id: id });
    } catch (err) {
      error = err;
      throw error;
    }

    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('throws when you try to delete another Users task', async () => {
    //requires create task
    const taskList = await createTasksFromFaker(1, otherUser.id);
    const task = taskList[0];

    let error;
    try {
      await deleteTask({ id: task.id });
    } catch (err) {
      error = err;
    } finally {
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.map(task => task.id),
          },
        },
      });
    }

    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });
});

// It deletes the task
// It throws when the task doesn't exist - done
// It throws when you try to delete another User's task
//
