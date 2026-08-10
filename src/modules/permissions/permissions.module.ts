import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { UserRolesController } from './user-roles.controller';

@Module({
  controllers: [PermissionsController, RolesController, UserRolesController],
  providers: [PermissionsService, RolesService],
  exports: [PermissionsService, RolesService],
})
export class PermissionsModule {}
