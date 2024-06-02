import { InjectModel } from "@nestjs/mongoose";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator
} from "class-validator";
import { Model } from "mongoose";
import { User } from "src/user/models/user.schema";
import { ConflictException, HttpStatus } from "@nestjs/common";
import { JsonResponse } from "./json-response";

@ValidatorConstraint({ name: "IsUniqueUser", async: true })
export class UniqueValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private jsonResponse: JsonResponse
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const filter = {};
    const options: UniqueValidationOptions = args.constraints[0];
    filter[args.property] = value;
    const exist = await this.userModel.findOne(filter);
    const message = options.message ? options.message : `The given ${value} is already used`
    
    if(exist) {
      throw new ConflictException(this.jsonResponse.error(message))
    }
    
    return !exist;
  }
  
}

export function IsUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [validationOptions],
      validator: UniqueValidator,
    });
  };
}
export class UniqueValidationOptions {
  message?: string;
}