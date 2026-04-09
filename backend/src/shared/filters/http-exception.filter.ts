import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones — Pórtico Backend
 * Normaliza TODOS los errores a una estructura JSON consistente:
 * {
 *   statusCode: number,
 *   error:      string,   // Tipo de error en SCREAMING_SNAKE_CASE
 *   message:    string,   // Mensaje legible para el frontend
 *   path:       string,   // URL que causó el error
 *   timestamp:  string    // ISO 8601
 * }
 */
@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Ocurrió un error inesperado. Inténtalo más tarde.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        // ValidationPipe envía array de mensajes → los unimos
        if (Array.isArray(body.message)) {
          message = (body.message as string[]).join('; ');
        } else {
          message = (body.message as string) || message;
        }
      }

      errorCode = this.statusToCode(status);
    } else if (exception instanceof Error) {
      // Errores de Firestore, axios, etc.
      message = this.sanitizeMessage(exception.message);
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    const body = {
      statusCode: status,
      error: errorCode,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] ?? 'UNKNOWN_ERROR';
  }

  /** Oculta mensajes internos de GCP/Firestore al cliente */
  private sanitizeMessage(msg: string): string {
    if (msg.includes('Firestore') || msg.includes('GRPC') || msg.includes('firebase')) {
      return 'Error interno al acceder a la base de datos. Inténtalo más tarde.';
    }
    if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
      return 'No se pudo conectar con un servicio externo. Inténtalo más tarde.';
    }
    return 'Ocurrió un error inesperado. Inténtalo más tarde.';
  }
}
