import { ArgumentMetadata, BadRequestException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common"
import mongoose from "mongoose"

@Injectable()
export class ObjectIDValidationPipe implements PipeTransform
{
    transform(value: any, metadata: ArgumentMetadata) {
        if(mongoose.Types.ObjectId.isValid(value)) return value;
        throw new BadRequestException({
            statusCode:HttpStatus.BAD_REQUEST,
            messagge:"Invalid ID"
        });
        
    }

}