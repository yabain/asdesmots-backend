import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { Request, Response } from "express";
import { MongoError } from 'mongodb'
import { JsonResponse } from "../helpers/json-response";

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter<MongoError>
{
    catch(exception: MongoError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>();
        let error='Bad Request'

        if(request.url.indexOf("register")) error="BadRegistrationRequest";
        // response
        // .status(400)
        // .json({
        //     error,
        //     message:[exception.errmsg,...exception.errorLabels]
        // });
        
        let jsonResponse = new JsonResponse();
        
        response
          .status(400)
          .json(jsonResponse.error(exception.errmsg, exception.errorLabels));

    }
    
}