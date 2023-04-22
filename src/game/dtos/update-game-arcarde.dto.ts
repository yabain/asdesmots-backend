import { PartialType } from "@nestjs/mapped-types";
import { CreateGameArcardeDTO } from "./create-game-arcarde.dto";

export class UpdateGameArcarde  extends PartialType(CreateGameArcardeDTO)
{}