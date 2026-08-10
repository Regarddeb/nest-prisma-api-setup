import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'reports.export',
    description: 'Lowercase "resource.action" key',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+(-[a-z0-9]+)*$/, {
    message:
      'key must look like "resource.action" (lowercase, dash-separated words)',
  })
  key: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
