import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it } from 'vitest';
import { ByuAccountType, prisma, User } from '../../../../../prisma/client';
import { ByuAccount, byuAccountService, generateDummyAccountData } from '@fhss-web-team/backend-utils';
import { ROLES } from '../../../../security';

describe('Create User', () => {
  let requestingUser: User;
  let createUser: ReturnType<typeof appRouter.createCaller>['userManagement']['createUser'];

  let dummyAccount: ByuAccount;

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-users-full-access'],
        roles: [],
      }),
    });

    createUser = appRouter.createCaller({ userId: requestingUser.id }).userManagement.createUser;

    dummyAccount = generateDummyAccountData(ByuAccountType.Student);
    vi.spyOn(byuAccountService, 'getAccountsByNetId').mockReturnValue(Promise.resolve([dummyAccount]));

    vi.mock('../../../../security', async importOriginal => {
      const security = await importOriginal();
      return {
        ...(security as object),
        DEFAULT_ROLE: null,
      };
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
    vi.restoreAllMocks();
  });

  it('creates and returns a new user', async () => {
    try {
      const newUser = await createUser({ netId: dummyAccount.netId });
      const foundUser = await prisma.user.findUnique({
        where: { netId: dummyAccount.netId },
      });

      expect(newUser).toBeDefined();
      expect(foundUser).toBeDefined();
      expect(newUser.roles).toHaveLength(0);
    } finally {
      await prisma.user.delete({
        where: { netId: dummyAccount.netId },
      });
    }
  });

  it('reports duplicate user', async () => {
    try {
      await createUser({ netId: dummyAccount.netId });
      let error;
      try {
        await createUser({ netId: dummyAccount.netId });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error).toHaveProperty('code', 'CONFLICT');

      const foundUser = await prisma.user.findUnique({
        where: { netId: dummyAccount.netId },
      });
      expect(foundUser).toBeDefined();
    } finally {
      await prisma.user.delete({
        where: { netId: dummyAccount.netId },
      });
    }
  });

  it('gives roles', async () => {
    try {
      const newUser = await createUser({
        netId: dummyAccount.netId,
        roles: [ROLES[0]],
      });
      const foundUser = await prisma.user.findUnique({
        where: { netId: dummyAccount.netId },
      });

      expect(newUser).toBeDefined();
      expect(foundUser).toBeDefined();
      expect(newUser.roles).toHaveLength(1);
      expect(newUser.roles).toContain(ROLES[0]);
    } finally {
      await prisma.user.delete({
        where: { netId: dummyAccount.netId },
      });
    }
  });
});
