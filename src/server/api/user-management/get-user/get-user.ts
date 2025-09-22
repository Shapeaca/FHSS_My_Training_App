import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { authorizedProcedure } from '../../trpc';
import { prisma } from '../../../../../prisma/client';

const getUserInput = z.object({
  userId: z.string(),
});

const getUserOutput = z.object({
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
  lastLogin: z.date().nullable(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

export const getUser = authorizedProcedure
  .meta({ requiredPermissions: ['manage-users-full-access'] })
  .input(getUserInput)
  .output(getUserOutput)
  .mutation(async opts => {
    const user = await prisma.user.findUnique({
      where: { id: opts.input.userId },
    });
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }
    return user;
  });
