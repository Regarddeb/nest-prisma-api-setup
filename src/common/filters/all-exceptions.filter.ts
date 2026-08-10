import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface ErrorBody {
  message?: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode: number = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttpException
      ? this.extractMessage(exception.getResponse())
      : 'Internal server error';

    const errorName =
      exception instanceof Error ? exception.name : 'InternalServerError';

    const logPayload = {
      method: request.method,
      path: request.originalUrl ?? request.url,
      statusCode,
      message,
    };

    if (statusCode >= 500) {
      this.logger.error(
        {
          ...logPayload,
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        'Unhandled exception',
      );
    } else {
      this.logger.warn(logPayload, 'Handled exception');
    }

    const isProduction = process.env.NODE_ENV === 'production';

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: errorName,
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
      ...(!isProduction && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    });
  }

  private extractMessage(exceptionResponse: unknown): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as ErrorBody).message ?? 'Unexpected error';
    }
    return 'Unexpected error';
  }
}
