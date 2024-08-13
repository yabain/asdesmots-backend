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
import { CompetitionGame } from "../models";

@ValidatorConstraint({ name: "IsUniqueCompetition", async: true })
export class UniqueCompetitionValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(CompetitionGame.name) 
    private readonly competitionGame: Model<CompetitionGame>,
    private jsonResponse: JsonResponse
  ) {}

  async validate(value: any, args: ValidationArguments) {
    const filter = {};
    const options: UniqueValidationOptions = args.constraints[0];
    filter[args.property] = value;
    const exist = await this.competitionGame.findOne(filter);
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
      validator: UniqueCompetitionValidator,
    });
  };
}
export class UniqueValidationOptions {
  message?: string;
}