import z from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { DEFAULT_ROLE, Role, ROLES } from '../../../../security';
import { authorizedProcedure } from '../../trpc';
import { userService } from '../../../services/user';
import { rethrowKnownPrismaError } from '../../../utils/prisma';

const createUserInput = z.object({
  netId: z.string(),
  roles: z.array(z.literal(ROLES)).optional(),
});

const createUserOutput = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  accountType: z.string(),
  netId: z.string(),
  byuId: z.string().nullable(),
  workerId: z.string().nullable(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  suffix: z.string().nullable(),
  preferredFirstName: z.string(),
  preferredLastName: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  lastLogin: z.date().nullable(),
});

export const createUser = authorizedProcedure
  .meta({ requiredPermissions: ['manage-users-full-access'] })
  .input(createUserInput)
  .output(createUserOutput)
  .mutation(async opts => {
    try {
      const roles = new Set<Role>(opts.input.roles);
      if (DEFAULT_ROLE) {
        roles.add(DEFAULT_ROLE);
      }
      return await userService.createUser(opts.input.netId, Array.from(roles));
    } catch (error) {
      rethrowKnownPrismaError(error);
      if (error instanceof Error && error.message.includes('account')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }
      throw error;
    }
  });
