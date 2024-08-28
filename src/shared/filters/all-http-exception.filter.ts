import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
 
@Catch(HttpException)
export class AllHttpExceptionsFilter extends BaseExceptionFilter {
  
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus(); 
 
    response
      .status(status)
      .json(exception.response);
  }
}