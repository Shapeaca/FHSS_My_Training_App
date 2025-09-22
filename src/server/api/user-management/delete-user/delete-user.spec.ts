import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';

describe('Delete user', () => {
  let requestingUser: User;
  let deleteUser: ReturnType<typeof appRouter.createCaller>['userManagement']['deleteUser'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-users-full-access'],
        roles: [],
      }),
    });
    deleteUser = appRouter.createCaller({ userId: requestingUser.id }).userManagement.deleteUser;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('deletes the user', async () => {
    const userData = generateDummyUserData({});
    const user = await prisma.user.create({ data: userData });

    await deleteUser({ userId: user.id });
    const foundUser = await prisma.user.findUnique({
      where: { netId: userData.netId },
    });

    expect(foundUser).toBeNull();
  });

  it("errors if user doesn't exist", async () => {
    let error;
    try {
      await deleteUser({ userId: faker.string.uuid() });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });
});
