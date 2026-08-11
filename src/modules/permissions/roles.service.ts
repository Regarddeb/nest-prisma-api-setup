import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const ROLE_WITH_PERMISSIONS = {
  permissions: { include: { permission: true } },
} as const;

@Injectable()
export class RolesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(dto: CreateRoleDto) {
    return this.databaseService.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? {
              create: dto.permissionIds.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: ROLE_WITH_PERMISSIONS,
    });
  }

  findAll() {
    return this.databaseService.role.findMany({
      include: ROLE_WITH_PERMISSIONS,
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: number) {
    return this.databaseService.role.findUniqueOrThrow({
      where: { id },
      include: ROLE_WITH_PERMISSIONS,
    });
  }

  update(id: number, dto: UpdateRoleDto) {
    return this.databaseService.role.update({
      where: { id },
      data: dto,
      include: ROLE_WITH_PERMISSIONS,
    });
  }

  remove(id: number) {
    return this.databaseService.role.delete({ where: { id } });
  }

  async assignPermissions(roleId: number, permissionIds: number[]) {
    await this.databaseService.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    });
    return this.findOne(roleId);
  }

  async revokePermission(roleId: number, permissionId: number) {
    await this.databaseService.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    return this.findOne(roleId);
  }

  async assignToUser(userId: number, roleIds: number[]) {
    await this.databaseService.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
      skipDuplicates: true,
    });
    return this.databaseService.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async revokeFromUser(userId: number, roleId: number) {
    await this.databaseService.userRole.delete({
      where: { userId_roleId: { userId, roleId } },
    });
    return this.databaseService.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }
}
