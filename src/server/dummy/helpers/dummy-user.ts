import { ByuAccountType, Prisma } from '../../../../prisma/client';
import { faker } from '@faker-js/faker';
import { generateDummyAccountData } from '@fhss-web-team/backend-utils';
import { Permission, Role } from '../../../security';

/**
 * Generates dummy user data for testing or seeding purposes.
 *
 * @param opts - Optional configuration for the dummy user data.
 * @returns A Prisma.UserCreateInput object populated with dummy data.
 * @see Prisma.UserCreateInput
 */
export function generateDummyUserData(opts?: {
  accountType?: ByuAccountType;
  roles?: Role[];
  permissions?: Permission[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLogin?: Date | string | null;
}): Prisma.UserCreateInput {
  const acct = generateDummyAccountData(
    opts?.accountType ?? faker.helpers.enumValue(ByuAccountType)
  );
  return {
    ...acct,
    createdAt: opts?.createdAt ?? faker.date.past(),
    updatedAt: opts?.updatedAt ?? faker.date.recent(),
    lastLogin: opts?.lastLogin ?? faker.date.past(),
    roles: opts?.roles ?? [],
    permissions: opts?.permissions ?? [],
  };
}
