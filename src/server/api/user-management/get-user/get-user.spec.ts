import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { describe, expect, it } from 'vitest';
import { prisma, User } from '../../../../../prisma/client';

describe('Get user', () => {
  let requestingUser: User;
  let getUser: ReturnType<typeof appRouter.createCaller>['userManagement']['getUser'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-users-full-access'],
        roles: [],
      }),
    });
    getUser = appRouter.createCaller({ userId: requestingUser.id }).userManagement.getUser;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('returns the user', async () => {
    const userData = generateDummyUserData({});
    const user = await prisma.user.create({ data: userData });
    try {
      const foundUser = await getUser({ userId: user.id });

      expect(foundUser.id).toBe(user.id);
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it("errors if user doesn't exist", async () => {
    let error;
    try {
      await getUser({ userId: 'i-dont-exist' });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });
});
