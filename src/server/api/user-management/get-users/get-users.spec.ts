import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { describe, expect, it } from 'vitest';
import { ByuAccountType, prisma, User } from '../../../../../prisma/client';

describe('Get users', () => {
  let requestingUser: User;
  let getUsers: ReturnType<typeof appRouter.createCaller>['userManagement']['getUsers'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-users-full-access'],
        roles: [],
      }),
    });
    getUsers = appRouter.createCaller({ userId: requestingUser.id }).userManagement.getUsers;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('gets users', async () => {
    const input: Parameters<typeof getUsers>[0] = {
      search: '',
      filters: { netId: requestingUser.netId, preferredName: undefined },
      sort: { property: 'netId', direction: 'asc' },
      page: { size: 10, index: 0 },
      accountTypes: [],
      createdAt: {},
    };
    const result = await getUsers(input);

    expect(result.totalCount).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('filters by account type', async () => {
    const userData = generateDummyUserData({
      accountType: ByuAccountType.Employee,
    });
    const user = await prisma.user.create({ data: userData });
    try {
      const input: Parameters<typeof getUsers>[0] = {
        search: '',
        filters: { netId: user.netId, preferredName: undefined },
        sort: { property: 'netId', direction: 'asc' },
        page: { size: 10, index: 0 },
        accountTypes: [ByuAccountType.Student],
        createdAt: {},
      };
      const result = await getUsers(input);

      expect(result.totalCount).toBe(0);
      expect(result.data).toHaveLength(0);
    } finally {
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it('gets page size', async () => {
    const userCount = 10;
    const usersData = Array.from({ length: userCount }, () => generateDummyUserData());
    const users = await prisma.user.createManyAndReturn({ data: usersData });
    try {
      const input: Parameters<typeof getUsers>[0] = {
        search: '',
        filters: { netId: undefined, preferredName: undefined },
        sort: { property: 'netId', direction: 'asc' },
        page: { size: 5, index: 0 },
        accountTypes: [],
        createdAt: {},
      };
      const result = await getUsers(input);

      expect(result.data).toHaveLength(input.page.size);
      expect(result.totalCount).toBeGreaterThan(userCount);
    } finally {
      await prisma.user.deleteMany({
        where: { OR: users.map(usr => ({ id: usr.id })) },
      });
    }
  });
});
