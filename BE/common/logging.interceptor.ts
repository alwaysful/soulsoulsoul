import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization'];

// 비밀번호, 토큰 등 민감 필드를 재귀적으로 마스킹
function mask(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(mask);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => {
        const key = k.toLowerCase();
        const sensitive = key === 'code' || SENSITIVE_KEYS.some((s) => key.includes(s));
        return [k, sensitive ? '***' : mask(v)];
      }),
    );
  }
  return value;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, originalUrl, query } = request;
    const body: unknown = request.body;

    // Request Log
    const requestLog: {
      timestamp: string;
      method: string;
      url: string;
      query?: unknown;
      body?: unknown;
    } = {
      timestamp: new Date().toISOString(),
      method,
      url: originalUrl,
    };

    // GET 요청 → query params 기록
    if (method === 'GET') {
      requestLog.query = mask(query);
    }

    // POST, PUT, DELETE 요청 request body 기록
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      requestLog.body = mask(body);
    }

    console.log('[Request]', requestLog);

    // Response Log
    return next.handle().pipe(
      tap((responseBody: unknown) => {
        console.log('[Response]', {
          timestamp: new Date().toISOString(),
          method,
          url: originalUrl,
          status: response.statusCode,
          body: mask(responseBody),
        });
      }),
    );
  }
}
