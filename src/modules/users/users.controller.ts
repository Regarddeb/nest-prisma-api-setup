import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from 'src/common/constants/permissions.constant';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { FindAllUsersQueryDto } from './dto/find-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(PERMISSIONS.USERS_READ)
  @ApiOperation({ summary: 'List users' })
  findAll(@Query() query: FindAllUsersQueryDto) {
    return this.usersService.findAll({
      skip: query.skip,
      take: query.take,
      cursor: query.cursor,
      where: query.where,
      orderBy: query.orderBy,
    });
  }

  @Get(':id')
  @Permissions(PERMISSIONS.USERS_READ)
  @ApiOperation({ summary: 'Get a user by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.USERS_UPDATE)
  @ApiOperation({ summary: "Update a user's profile" })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update({ where: { id }, data: updateUserDto });
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.USERS_DELETE)
  @ApiOperation({ summary: 'Delete a user' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove({ id });
  }
}
