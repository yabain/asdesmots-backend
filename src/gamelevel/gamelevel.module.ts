import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GameLevelController, WordGameLevelController } from "./controllers";
import { GameLevel, GameLevelSchema, WordGameLevel, WordGameLevelSchema } from "./models";
import { GameLevelService, WordGameLevelService } from "./services";

@Module({
    controllers:[
        WordGameLevelController,
        GameLevelController
    ],
    imports:[
        MongooseModule.forFeature([
            {name:WordGameLevel.name,schema:WordGameLevelSchema},
            {name:GameLevel.name,schema:GameLevelSchema}
        ]),
    ],
    providers:[
        WordGameLevelService,
        GameLevelService
    ],
    exports:[]
})
export class GameLevelModule{}