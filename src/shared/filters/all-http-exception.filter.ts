import { Catch, ArgumentsHost, Inject, HttpServer, HttpStatus, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { JsonResponse } from '../helpers/json-response';
 
@Catch(HttpException)
export class AllHttpExceptionsFilter extends BaseExceptionFilter {
 
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    // console.log("Exception ",exception.response)
  
    // const message = (exception instanceof Error) ? exception.message : exception.message.error;
    const error = exception.getResponse();
    let stringMessage = 'An error occurred while processing your request.';
    let errorData = [];
    if(error instanceof String) { // If it is a thrown exception
      stringMessage = error.toString();
    } else if (error.message) { // If the error come from custom Jsonresponse class
      stringMessage = error.message;
      if(error.data) {
        stringMessage = error.data;
      }
    } else { // If it is a common error
      stringMessage = error;
    }
    
    let jsonResponse = new JsonResponse();
    
    response
      .status(status)
      // .json(exception.response);
      .json(jsonResponse.error(stringMessage, errorData));
  }
}