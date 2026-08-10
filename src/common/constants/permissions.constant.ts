export const PERMISSIONS = {
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  POSTS_CREATE: 'posts.create',
  POSTS_READ: 'posts.read',
  POSTS_UPDATE: 'posts.update',
  POSTS_DELETE: 'posts.delete',

  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_MANAGE: 'permissions.manage',

  ACTIVITY_LOGS_READ: 'activity-logs.read',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  [PERMISSIONS.USERS_CREATE]: 'Create users',
  [PERMISSIONS.USERS_READ]: 'View users',
  [PERMISSIONS.USERS_UPDATE]: 'Update users',
  [PERMISSIONS.USERS_DELETE]: 'Delete users',

  [PERMISSIONS.POSTS_CREATE]: 'Create posts',
  [PERMISSIONS.POSTS_READ]: 'View posts',
  [PERMISSIONS.POSTS_UPDATE]: 'Update posts',
  [PERMISSIONS.POSTS_DELETE]: 'Delete posts',

  [PERMISSIONS.ROLES_MANAGE]:
    'Create, update, delete roles and their permission assignments',
  [PERMISSIONS.PERMISSIONS_MANAGE]: 'Create, update, delete permissions',

  [PERMISSIONS.ACTIVITY_LOGS_READ]: 'View the activity log audit trail',
};

export const DEFAULT_ROLES = {
  ADMIN: {
    name: 'admin',
    description: 'Full access to all resources',
    isSystem: true,
    permissions: Object.values(PERMISSIONS),
  },
  USER: {
    name: 'user',
    description: 'Default role granted to newly registered users',
    isSystem: true,
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.POSTS_READ,
      PERMISSIONS.POSTS_CREATE,
    ] as PermissionKey[],
  },
} as const;
