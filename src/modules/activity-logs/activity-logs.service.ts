import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/modules/database/database.service';

interface RecordActivityInput {
  userId: number;
  action: string;
  method: string;
  path: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

interface FindAllParams {
  skip?: number;
  take?: number;
  userId?: number;
  action?: string;
  from?: Date;
  to?: Date;
}

@Injectable()
export class ActivityLogsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async record(input: RecordActivityInput) {
    return this.databaseService.activityLog.create({
      data: {
        ...input,
        metadata: input.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async findAll(params: FindAllParams) {
    const { skip, take, userId, action, from, to } = params;

    const where: Prisma.ActivityLogWhereInput = {
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.databaseService.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      this.databaseService.activityLog.count({ where }),
    ]);

    return { items, total, skip: skip ?? 0, take: take ?? items.length };
  }
}
