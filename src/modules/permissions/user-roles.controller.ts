import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from 'src/common/constants/permissions.constant';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { AssignUserRolesDto } from './dto/assign-user-roles.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Permissions(PERMISSIONS.ROLES_MANAGE)
@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Assign roles to a user' })
  assign(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: AssignUserRolesDto,
  ) {
    return this.rolesService.assignToUser(userId, dto.roleIds);
  }

  @Delete(':roleId')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  revoke(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rolesService.revokeFromUser(userId, roleId);
  }
}
