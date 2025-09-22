import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';
import { PERMISSIONS, ROLES } from '../../../../security';

describe('Set access', () => {
  let requestingUser: User;
  let setAccess: ReturnType<
    typeof appRouter.createCaller
  >['userManagement']['setAccess'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-users-full-access'],
        roles: [],
      }),
    });
    setAccess = appRouter.createCaller({ userId: requestingUser.id })
      .userManagement.setAccess;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('errors if no roles nor permissions are provided', async () => {
    let err;
    try {
      await setAccess({ userId: requestingUser.id });
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err).toHaveProperty('code', 'BAD_REQUEST');
  });

  it("errors if user doesn't exist", async () => {
    let err;
    try {
      await setAccess({
        userId: faker.string.uuid(),
        roles: [faker.helpers.arrayElement(ROLES)],
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err).toHaveProperty('code', 'NOT_FOUND');
  });

  it('applies given roles and permissions', async () => {
    const userData = generateDummyUserData({});
    const user = await prisma.user.create({ data: userData });
    const role = faker.helpers.arrayElement(ROLES);
    const perm = faker.helpers.arrayElement(PERMISSIONS);
    try {
      await setAccess({
        userId: user.id,
        roles: [role],
        permissions: [perm],
      });

      const foundUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(foundUser).not.toBeNull();
      expect(foundUser?.roles).toHaveLength(1);
      expect(foundUser?.roles).toContain(role);
      expect(foundUser?.permissions).toHaveLength(1);
      expect(foundUser?.permissions).toContain(perm);
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it('removes acces if given empty arrays', async () => {
    const userData = generateDummyUserData({});
    const user = await prisma.user.create({
      data: { ...userData, roles: ['admin'], permissions: ['do-something'] },
    });
    try {
      await setAccess({
        userId: user.id,
        roles: [],
        permissions: [],
      });

      const foundUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(foundUser).not.toBeNull();
      expect(foundUser?.roles).toHaveLength(0);
      expect(foundUser?.permissions).toHaveLength(0);
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it("doesn't change undefined params", async () => {
    const userData = generateDummyUserData({});
    const user = await prisma.user.create({
      data: { ...userData, roles: ['admin'], permissions: ['do-something'] },
    });
    try {
      await setAccess({
        userId: user.id,
        permissions: [],
      });

      const foundUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(foundUser).not.toBeNull();
      expect(foundUser?.roles).toHaveLength(1);
      expect(foundUser?.roles).toContain('admin');
      expect(foundUser?.permissions).toHaveLength(0);
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
});
