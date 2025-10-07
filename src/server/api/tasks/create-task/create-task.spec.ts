import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';
import { totalmem } from 'os';

describe('Create task', () => {
  let requestingUser: User;
  let createTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['createTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
      }),
    });
    createTask = appRouter.createCaller({ userId: requestingUser.id }).tasks
      .createTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('returns a valid Task.id', async () => {
    const fakeTitle = faker.hacker.verb();
    const fakeDescription = faker.hacker.phrase();
    const fakeDate = faker.date.soon({ days: 5 });
    try {
      const taskId = await createTask({
        title: fakeTitle,
        description: fakeDescription,
        dueDate: fakeDate,
      });

      expect(taskId).toBeDefined();
    } finally {
    }
  });

  it('sets the values properly', async () => {
    const fakeTitle = faker.hacker.verb();
    const fakeDescription = faker.hacker.phrase();
    const fakeDate = faker.date.soon({ days: 50 });
    try {
      const taskId = await createTask({
        title: fakeTitle,
        description: fakeDescription,
        dueDate: fakeDate,
      });

      const databaseTask = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
      });

      //Validation of the data we put in
      expect(databaseTask).toHaveProperty('title', fakeTitle);
      expect(databaseTask).toHaveProperty('description', fakeDescription);
      expect(databaseTask).toHaveProperty('dueDate', fakeDate);
      expect(databaseTask).toHaveProperty('ownerId', requestingUser.id);
    } finally {
    }
  });
});

//It Tests:
// It returns a process id - If I created one thing, one thing was returned
// Sets the parameters in the create object properly
//
