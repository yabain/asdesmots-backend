import { InjectModel } from "@nestjs/mongoose";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator
} from "class-validator";
import { ConflictException, HttpStatus } from "@nestjs/common";
import { WordGameLevel } from "../models";
import { Model } from "mongoose";
import { JsonResponse } from "src/shared/helpers/json-response";

@ValidatorConstraint({ name: "IsUniqueWord", async: true })
export class UniqueWordValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(WordGameLevel.name) 
    private readonly wordGameLevel: Model<WordGameLevel>,
    private jsonResponse: JsonResponse
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const filter = {};
    const options: UniqueValidationOptions = args.constraints[0];
    filter[args.property] = value;
    const exist = await this.wordGameLevel.findOne(filter);
    const message = options.message ? options.message : `The given ${value} is already used`
    
    if(exist) {
      throw new ConflictException(this.jsonResponse.error(message,{alreadyUsed: true}));
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
      validator: UniqueWordValidator,
    });
  };
}
export class UniqueValidationOptions {
  message?: string;
}