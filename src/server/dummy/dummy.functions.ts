import { cleanJwts } from "./functions/sys/clean-jwts";
import { createUsers } from "./functions/users/create-users";
import { deleteUsers } from "./functions/users/delete-users.js";
import type { DummyFunction } from '@fhss-web-team/backend-utils';

export const dummyFunctions: DummyFunction[] = [
	createUsers,
	deleteUsers,
	cleanJwts,
];