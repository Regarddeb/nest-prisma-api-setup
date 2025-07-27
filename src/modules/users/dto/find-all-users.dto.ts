import { IsOptional, IsNumber, IsObject } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Prisma } from 'generated/prisma';

export class FindAllUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => JSON.parse(value))
  cursor?: Prisma.UserWhereUniqueInput;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => JSON.parse(value))
  where?: Prisma.UserWhereInput;

  @IsOptional()
  @IsObject()
  @Transform(({ value }) => JSON.parse(value))
  orderBy?: Prisma.UserOrderByWithRelationInput;
}
