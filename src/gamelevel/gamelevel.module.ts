import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QueuesModule } from "src/queues/queues.module";
import { JsonResponse } from "src/shared/helpers/json-response";
import { GameLevelController, WordGameLevelController } from "./controllers";
import { GameLevel, GameLevelSchema, WordGameLevel, WordGameLevelSchema } from "./models";
import { GameLevelService, WordGameLevelService } from "./services";
import { UniqueLevelValidator } from "./validators/level-unique";
import { UniqueWordValidator } from "./validators/word-unique";

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
        GameLevelService,
        JsonResponse,
        UniqueWordValidator,
        UniqueLevelValidator
    ],
    exports:[GameLevelService]
})
export class GameLevelModule{}