import { PartialType } from "@nestjs/mapped-types";
import { CreateWordGameLevelDTO } from "./create-word-gamelevel.dto";

export class UpdateWordGameLevelDTO extends PartialType(CreateWordGameLevelDTO){}