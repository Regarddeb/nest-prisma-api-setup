import { SetMetadata } from '@nestjs/common';
import { PermissionKey } from '../constants/permissions.constant';

export const PERMISSIONS_KEY = 'permissions';

/** Requires the current user to hold ALL of the given permission keys. */
export const Permissions = (...permissions: PermissionKey[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
