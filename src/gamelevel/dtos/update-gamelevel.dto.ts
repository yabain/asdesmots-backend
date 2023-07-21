import { PartialType } from "@nestjs/mapped-types";
import { CreateGameLevelDTO } from "./create-gamelevel.dto";

export class UpdateGameLevelDTO extends PartialType(CreateGameLevelDTO){}