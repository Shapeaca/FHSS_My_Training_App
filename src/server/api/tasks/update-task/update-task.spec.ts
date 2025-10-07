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
    otherUser = await prisma.user.create({
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

  it('successfully updates the task:', async () => {
    const taskList = await createTasksFromFaker(2, requestingUser.id);
    const task = taskList[0];
    const nwTaskData = taskList[1];

    try {
      // Setting Up test
      await prisma.task.update({
        data: {
          status: TaskStatus.INCOMPLETE,
        },
        where: {
          id: task.id,
        },
      });

      //Updating all atributes
      await updateTask({
        id: task.id,
        title: nwTaskData.title,
        description: nwTaskData.description,
        dueDate: nwTaskData.dueDate,
        status: TaskStatus.COMPLETE,
      });

      const foundTask = await prisma.task.findUnique({
        where: {
          id: task.id,
        },
      });

      expect(foundTask).toBeTruthy();
      expect(foundTask?.title).toBe(nwTaskData.title);
      expect(foundTask?.description).toBe(nwTaskData.description);
      expect(foundTask?.dueDate).toBe(nwTaskData.dueDate);
      expect(foundTask?.status).toBe(TaskStatus.COMPLETE);
      const allowedTimeOffsetMilli = 2000;
      const dateNow = Date.now();
      //Completed Date is good
      expect(foundTask?.completedDate).toBeGreaterThan(
        dateNow - allowedTimeOffsetMilli
      );
      expect(foundTask?.completedDate).toBeLessThan(
        dateNow + allowedTimeOffsetMilli
      );
      //updated Date is good
      expect(foundTask?.updatedDate).toBeGreaterThan(
        dateNow - allowedTimeOffsetMilli
      );
      expect(foundTask?.updatedDate).toBeLessThan(
        dateNow + allowedTimeOffsetMilli
      );
    } catch (error) {
      throw error;
    } finally {
      //clean up
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.map(task => task.id),
          },
        },
      });
    }
  });

  it('does not update updatedDate when nothing has changed', async () => {
    const taskList = await createTasksFromFaker(1, requestingUser.id);
    const task = taskList[0];

    try {
      // Setting Up test
      await prisma.task.update({
        data: {
          status: TaskStatus.INCOMPLETE,
        },
        where: {
          id: task.id,
        },
      });

      //Updating all atributes
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: TaskStatus.INCOMPLETE,
      });

      const foundTask = await prisma.task.findUnique({
        where: {
          id: task.id,
        },
      });

      expect(foundTask).toBeTruthy();
      expect(foundTask?.updatedDate).toBe(task.updatedDate);
    } catch (error) {
      throw error;
    } finally {
      //clean up
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.map(task => task.id),
          },
        },
      });
    }
  });

  it('does not update CompletedDate when status does not change to completed', async () => {
    const taskList = await createTasksFromFaker(1, requestingUser.id);
    const task = taskList[0];

    try {
      // Setting Up test
      await prisma.task.update({
        data: {
          status: TaskStatus.INCOMPLETE,
        },
        where: {
          id: task.id,
        },
      });

      //Updating all atributes
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: TaskStatus.IN_PROGRESS,
      });

      const foundTask = await prisma.task.findUnique({
        where: {
          id: task.id,
        },
      });

      expect(foundTask).toBeTruthy();
      expect(foundTask?.completedDate).toBeNull;
      expect(foundTask?.status).toBe(TaskStatus.IN_PROGRESS);
    } catch (error) {
      throw error;
    } finally {
      //clean up
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.map(task => task.id),
          },
        },
      });
    }
  });

  it('removes completed date when status is changed from completed', async () => {
    const taskList = await createTasksFromFaker(1, requestingUser.id);
    const task = taskList[0];

    try {
      // Setting Up test
      await prisma.task.update({
        data: {
          status: TaskStatus.COMPLETE,
        },
        where: {
          id: task.id,
        },
      });

      //Updating all atributes
      await updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: TaskStatus.IN_PROGRESS,
      });

      const foundTask = await prisma.task.findUnique({
        where: {
          id: task.id,
        },
      });

      expect(foundTask).toBeTruthy();
      expect(foundTask?.completedDate).toBeNull;
      expect(foundTask?.status).toBe(TaskStatus.IN_PROGRESS);
    } catch (error) {
      throw error;
    } finally {
      //clean up
      await prisma.task.deleteMany({
        where: {
          id: {
            in: taskList.map(task => task.id),
          },
        },
      });
    }
  });

  it('throws when task doesnt exist', async () => {
    let error;
    try {
      await updateTask({
        id: faker.database.mongodbObjectId(),
        title: faker.hacker.verb(),
        description: faker.hacker.phrase(),
        dueDate: faker.date.soon({ days: 10 }),
        status: TaskStatus.IN_PROGRESS,
      });
    } catch (err) {
      error = err;
    } finally {
    }
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('throws when you try to update someone elses task', async () => {
    const taskList = await createTasksFromFaker(1, otherUser.id);
    const task = taskList[0];

    let error;
    try {
      // Setting Up test
      await prisma.task.update({
        data: {
          status: TaskStatus.INCOMPLETE,
        },
        where: {
          id: task.id,
        },
      });

      await updateTask({
        id: task.id,
        title: faker.hacker.verb(),
        description: faker.hacker.phrase(),
        dueDate: faker.date.soon({ days: 10 }),
        status: TaskStatus.IN_PROGRESS,
      });
    } catch (err) {
      error = err;
    } finally {
      //clean up
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

/*It successfully updates the task in the database -  - Done, please check
        - It updates the updated field when anything changes. - Done, please check
It updates the completed field when and only when status is changed to completed  - Done, please check
It doesn't update when the function is called but nothing is different. - Done, please check
It throws when the task doesn't exist
It throws when you try to update someone else's task
*/
