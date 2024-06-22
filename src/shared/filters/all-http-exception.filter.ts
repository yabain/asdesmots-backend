import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { JsonResponse } from '../helpers/json-response';

@Catch(HttpException)
export class AllHttpExceptionsFilter extends BaseExceptionFilter implements ExceptionFilter {
  
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    const initialResponse = exception.getResponse();
    
    console.log(initialResponse);
    if(status >= 200 && status <= 299) {
      response.status(status).json(initialResponse);
    } else {
      let stringMessage = 'An error occurred while processing your request.';
      let errorData = null;
  
      // Utility function to check if a value is a valid JSON string
      const isJSON = (str: string): boolean => {
        try {
          JSON.parse(str);
          return true;
        } catch (e) {
          return false;
        }
      };
  
      // Parse error from JSON form if necessary
      const error = typeof initialResponse === 'string' && isJSON(initialResponse) 
        ? JSON.parse(initialResponse) 
        : initialResponse;
  
      if (typeof error === 'string') { // If it is a thrown exception
        stringMessage = error;
      } else if (error.message) { // If the error comes from a custom JsonResponse class
        stringMessage = error.message;
        if (error.data) {
          errorData = error.data;
        }
      } else { // If it is a common error
        errorData = error;
      }
    
      let jsonResponse = new JsonResponse();
      response
        .status(status)
        .json(
          errorData ? jsonResponse.error(stringMessage, errorData) : 
          jsonResponse.error(stringMessage)
        );
    }
  }
}
