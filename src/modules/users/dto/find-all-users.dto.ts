import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { Prisma } from 'generated/prisma';

export class FindAllUsersQueryDto {
  @ApiPropertyOptional({ description: 'Number of records to skip' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional({ description: 'Page size' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  take?: number;

  @ApiPropertyOptional({
    description: 'JSON-encoded Prisma UserWhereUniqueInput cursor',
    type: String,
  })
  @IsOptional()
  @IsObject()
  @Transform(
    ({ value }: { value: string }) =>
      JSON.parse(value) as Prisma.UserWhereUniqueInput,
  )
  cursor?: Prisma.UserWhereUniqueInput;

  @ApiPropertyOptional({
    description: 'JSON-encoded Prisma UserWhereInput filter',
    type: String,
  })
  @IsOptional()
  @IsObject()
  @Transform(
    ({ value }: { value: string }) =>
      JSON.parse(value) as Prisma.UserWhereInput,
  )
  where?: Prisma.UserWhereInput;

  @ApiPropertyOptional({
    description: 'JSON-encoded Prisma UserOrderByWithRelationInput',
    type: String,
  })
  @IsOptional()
  @IsObject()
  @Transform(
    ({ value }: { value: string }) =>
      JSON.parse(value) as Prisma.UserOrderByWithRelationInput,
  )
  orderBy?: Prisma.UserOrderByWithRelationInput;
}
