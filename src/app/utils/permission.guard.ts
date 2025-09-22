import { permissionGuardFactory } from '@fhss-web-team/frontend-utils';
import { Permission } from '../../security';

/**
 * A permission-based route guard.
 *
 * This guard checks if the current user has the required permissions to access a route.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user lacks the necessary permissions, they are redirected to the `/forbidden` page.
 *
 * @param requiredPermissions - An array of permission strings that the user must have.
 * @param haveAll - If `true`, the user must have all required permissions. If `false` or omitted, the user must have at least one of the required permissions.
 * @returns A `CanActivateFn` function to be used as a route guard.
 *
 * @example
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminPage,
 *     canActivate: [permissionGuard(['manage-users-full-access', 'see-data'], true)],
 *   },
 * ];
 * ```
 *
 * @see permissionGuardFactory
 * @see Permission
 */
export const permissionGuard = permissionGuardFactory<Permission>;
