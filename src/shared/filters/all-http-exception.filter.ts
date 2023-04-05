import { Catch, ArgumentsHost, Inject, HttpServer, HttpStatus, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
 
@Catch(HttpException)
export class AllHttpExceptionsFilter extends BaseExceptionFilter {
 
 
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    // const error = exception.()
    // console.log("Exception ",exception.response)
  
    const message = (exception instanceof Error) ? exception.message : exception.message.error;
 
   
    response
      .status(status)
      .json(exception.response);
  }
}