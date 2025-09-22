import { setAccess } from './user-management/set-access/set-access';
import { createUser } from './user-management/create-user/create-user';
import { deleteUser } from './user-management/delete-user/delete-user';
import { getUser } from './user-management/get-user/get-user';
import { getUsers } from './user-management/get-users/get-users';
import { router } from './trpc';

export const appRouter = router({
  userManagement: {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    setAccess,
  },
});
