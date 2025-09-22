import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { rethrowKnownPrismaError } from '../../../utils/prisma';

const deleteUserInput = z.object({
  userId: z.string(),
});

const deleteUserOutput = z.void();

export const deleteUser = authorizedProcedure
  .meta({ requiredPermissions: ['manage-users-full-access'] })
  .input(deleteUserInput)
  .output(deleteUserOutput)
  .mutation(async opts => {
    try {
      await prisma.user.delete({ where: { id: opts.input.userId } });
    } catch (err) {
      rethrowKnownPrismaError(err);
      throw err;
    }
  });
