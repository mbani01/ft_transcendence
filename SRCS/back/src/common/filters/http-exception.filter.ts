import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException) 
export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;
    const exceptionResponse = exception.getResponse();
    const error = typeof res === 'string' ? {message: exceptionResponse} : (exceptionResponse as object);
    res.status(status).json({
      ...error,
      timestamp: new Date().toISOString(),  
    })
  }
}
