import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';
import { ActivityLogsService } from 'src/modules/activity-logs/activity-logs.service';
import {
  ACTIVITY_LOG_ACTION_KEY,
  SKIP_ACTIVITY_LOG_KEY,
} from '../decorators/activity-log.decorator';
import { AuthenticatedUser } from '../types/authenticated-user.type';

const LOGGED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activityLogsService: ActivityLogsService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ActivityLogInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_ACTIVITY_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skip || !LOGGED_METHODS.has(request.method)) {
      return next.handle();
    }

    const action =
      this.reflector.getAllAndOverride<string>(ACTIVITY_LOG_ACTION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ??
      `${request.method} ${(request.route as { path?: string } | undefined)?.path ?? request.path}`;

    return next.handle().pipe(
      tap(() => {
        const user = (request as Request & { user?: AuthenticatedUser }).user;
        if (!user) return;

        this.activityLogsService
          .record({
            userId: user.id,
            action,
            method: request.method,
            path: request.originalUrl ?? request.url,
            statusCode: response.statusCode,
            ip: request.ip,
            userAgent: request.headers?.['user-agent'],
          })
          .catch((error: unknown) => {
            this.logger.error({ err: error }, 'Failed to write activity log');
          });
      }),
    );
  }
}
