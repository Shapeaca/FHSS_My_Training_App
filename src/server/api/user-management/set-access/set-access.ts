import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { PERMISSIONS, ROLES } from '../../../../security';
import { TRPCError } from '@trpc/server';
import { rethrowKnownPrismaError } from '../../../utils/prisma';

const setAccessInput = z.object({
  userId: z.string(),
  roles: z.array(z.literal(ROLES)).optional(),
  permissions: z.array(z.literal(PERMISSIONS)).optional(),
});

const setAccessOutput = z.object({
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

export const setAccess = authorizedProcedure
  .meta({ requiredPermissions: ['manage-users-full-access'] })
  .input(setAccessInput)
  .output(setAccessOutput)
  .mutation(async opts => {
    const input = opts.input;
    if (!input.roles && !input.permissions) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No input access given',
      });
    }
    try {
      return await prisma.user.update({
        where: { id: input.userId },
        data: {
          roles: input.roles,
          permissions: input.permissions,
        },
      });
    } catch (error) {
      rethrowKnownPrismaError(error);
      throw error;
    }
  });
