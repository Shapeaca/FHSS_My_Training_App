import { updateTask } from './tasks/update-task/update-task';
import { deleteTask } from './tasks/delete-task/delete-task';
import { createTask } from './tasks/create-task/create-task';
import { getTasksByUser } from './tasks/get-tasks-by-user/get-tasks-by-user';
import { setAccess } from './user-management/set-access/set-access';
import { createUser } from './user-management/create-user/create-user';
import { deleteUser } from './user-management/delete-user/delete-user';
import { getUser } from './user-management/get-user/get-user';
import { getUsers } from './user-management/get-users/get-users';
import { router } from './trpc';

export const appRouter = router({
  tasks: {
    deleteTask,
    createTask,
    updateTask,
    getTasksByUser,
  },
  userManagement: {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    setAccess,
  },
});
