import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from 'src/common/constants/permissions.constant';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { ActivityLogsService } from './activity-logs.service';
import { FindActivityLogsQueryDto } from './dto/find-activity-logs.dto';

@ApiTags('activity-logs')
@ApiBearerAuth()
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Permissions(PERMISSIONS.ACTIVITY_LOGS_READ)
  @ApiOperation({
    summary: 'List activity log entries (paginated, filterable)',
  })
  findAll(@Query() query: FindActivityLogsQueryDto) {
    return this.activityLogsService.findAll({
      skip: query.skip,
      take: query.take ?? 25,
      userId: query.userId,
      action: query.action,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }
}
