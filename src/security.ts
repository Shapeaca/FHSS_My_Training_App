// -- CONFIG --

/**
 * Maps each user role to an array of permissions granted to that role.
 */
export const ROLE_PERMISSION_MAP: Record<Role, Permission[]> = {
  admin: ['manage-users-full-access'],
  user: [],
};

/**
 * The role given to newly provisioned users.
 */
export const DEFAULT_ROLE: Role | null = null;

/**
 * A map specifying to which route the user should
 * be directed to upon login, based upon their role.
 */
export const DEFAULT_HOME_PAGES: Partial<Record<Role, string>> = {
  admin: '/admin',
};

// -- LISTS --

/**
 * The list of all access permissions, granting access to pages and resources.
 */
export const PERMISSIONS = ['manage-users-full-access'] as const;

/**
 * The list of all access roles.
 *
 * Roles are collections of permissions.
 * @see ROLE_PERMISSION_MAP
 */
export const ROLES = ['admin', 'user'] as const;

// -- TYPES --

/**
 * An access permission, granting access to pages and resources.
 */
export type Permission = (typeof PERMISSIONS)[number];
/**
 * A site access role.
 *
 * Roles are collections of permissions.
 * @see ROLE_PERMISSION_MAP
 */
export type Role = (typeof ROLES)[number];
