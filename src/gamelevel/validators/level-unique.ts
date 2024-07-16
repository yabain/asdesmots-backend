import { InjectModel } from "@nestjs/mongoose";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator
} from "class-validator";
import { ConflictException, HttpStatus } from "@nestjs/common";
import { Model } from "mongoose";
import { JsonResponse } from "src/shared/helpers/json-response";
import { GameLevel } from "../models";

@ValidatorConstraint({ name: "IsUniqueLevel", async: true })
export class UniqueLevelValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(GameLevel.name) 
    private readonly gameLevel: Model<GameLevel>,
    private jsonResponse: JsonResponse
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const filter = {};
    const options: UniqueValidationOptions = args.constraints[0];
    filter[args.property] = value;
    const exist = await this.gameLevel.findOne(filter);
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
      validator: UniqueLevelValidator,
    });
  };
}
export class UniqueValidationOptions {
  message?: string;
}