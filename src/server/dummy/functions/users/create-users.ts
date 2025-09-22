import { makeDummy } from '@fhss-web-team/backend-utils';
import z from 'zod/v4';
import { generateDummyUserData } from '../../helpers/dummy-user';
import { prisma } from '../../../../../prisma/client';
import { DEFAULT_ROLE, Role, ROLES } from '../../../../security';

export const createUsers = makeDummy({
  name: 'Create users',
  description: 'Creates a bunch of users (defaults to 10).',
  inputSchema: z.object({
    count: z.number().default(10),
    role: z.literal(ROLES).optional(),
  }),
  handler: async data => {
    const roles: Role[] = [];
    if (DEFAULT_ROLE) roles.push(DEFAULT_ROLE);
    if (data.role) roles.push(data.role);

    return await prisma.user.createManyAndReturn({
      data: Array.from({ length: data.count }, () =>
        generateDummyUserData({ roles })
      ),
    });
  },
});
