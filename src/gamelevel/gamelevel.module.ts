import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QueuesModule } from "src/queues/queues.module";
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
        forwardRef(() => QueuesModule),
    ],
    providers:[
        WordGameLevelService,
        GameLevelService
    ],
    exports:[GameLevelService]
})
export class GameLevelModule{}