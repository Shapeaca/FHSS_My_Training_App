import { makeDummy } from '@fhss-web-team/backend-utils';
import { prisma } from '../../../../../prisma/client';

export const deleteUsers = makeDummy({
  name: 'Delete users',
  description: 'Deletes all users',
  handler: async () => {
    return await prisma.user.deleteMany({});
  },
});
