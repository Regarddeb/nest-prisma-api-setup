import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './ceate-user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDto) {}
