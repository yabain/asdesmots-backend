import { InjectModel } from "@nestjs/mongoose";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
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
    filter[args.property] = value;
    const exist = await this.userModel.findOne(filter);
    
    if(exist) {
      throw new ConflictException(this.jsonResponse.error('User email already userd.'))
    }
    
    return !exist;
  }

  defaultMessage(args: ValidationArguments) {
    return "$(value) is already taken";
  }
}