import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/modules/database/database.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(dto: CreatePermissionDto) {
    return this.databaseService.permission.create({ data: dto });
  }

  findAll() {
    return this.databaseService.permission.findMany({
      orderBy: { key: 'asc' },
    });
  }

  findOne(id: number) {
    return this.databaseService.permission.findUniqueOrThrow({
      where: { id },
    });
  }

  update(id: number, dto: UpdatePermissionDto) {
    return this.databaseService.permission.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.databaseService.permission.delete({ where: { id } });
  }
}
