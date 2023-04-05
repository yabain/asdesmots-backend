import { ArgumentsHost, Catch, ConflictException, ExceptionFilter } from "@nestjs/common"
import { Request, Response } from "express";
import { MongoError } from 'mongodb'

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter<MongoError>
{
    catch(exception: MongoError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>();
        let error='Bad Request'

        if(request.url.indexOf("register")) error="BadRegistrationRequest";
        response
        .status(400)
        .json({
            statusCode: 400,
            error,
            message:[exception.errmsg,...exception.errorLabels]
        });

    }
    
}