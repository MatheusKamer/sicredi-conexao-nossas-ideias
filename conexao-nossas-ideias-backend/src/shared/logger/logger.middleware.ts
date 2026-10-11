import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startedAt = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || '-';
      const duration = Date.now() - startedAt;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${duration}ms - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
