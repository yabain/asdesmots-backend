import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose";
import { AuthorizationModule } from "src/authorization/authorization.module";
import { GameLevelModule } from "src/gamelevel/gamelevel.module";
import { SharedModule } from "src/shared/shared.module";
import { UserModule } from "src/user/user.module";
import { GameArcardeController, GameCompetitionController } from "./controllers";
import { CompetitionGame, CompetitionGameSchema, GameArcarde, GameArcardeSchema, GamePart, GamePartSchema, GameRound, GameRoundSchema, GameWinner, GameWinnerCriteria, GameWinnerCriteriaSchema, GameWinnerSchema, PlayerGameRegistration, PlayerGameRegistrationSchema } from "./models";
import { CompetitionGameService, GameArcardeService, GameWinnerCriteriaService } from "./services";

@Module({
    controllers:[
        GameArcardeController,
        GameCompetitionController
    ],
    imports:[
        MongooseModule.forFeature([
            {name:CompetitionGame.name,schema:CompetitionGameSchema},
            {name:GameArcarde.name,schema:GameArcardeSchema},
            {name:GamePart.name,schema:GamePartSchema},
            {name:GameRound.name,schema:GameRoundSchema},
            {name:GameWinnerCriteria.name,schema:GameWinnerCriteriaSchema},
            {name:GameWinner.name,schema:GameWinnerSchema},
            {name:PlayerGameRegistration.name,schema:PlayerGameRegistrationSchema},
        ]),
        SharedModule,
        UserModule,
        AuthorizationModule,
        GameLevelModule
    ],
    providers:[
        CompetitionGameService,
        GameArcardeService,
        GameWinnerCriteriaService
    ],
    exports:[CompetitionGameService,GameArcardeService]
})
export class GameModule{}