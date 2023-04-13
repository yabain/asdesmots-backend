import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose";
import { AuthorizationModule } from "src/authorization/authorization.module";
import { GameLevelModule } from "src/gamelevel/gamelevel.module";
import { SharedModule } from "src/shared/shared.module";
import { UserModule } from "src/user/user.module";
import { CompetitionGame, CompetitionGameSchema, GameArcarde, GameArcardeSchema, GamePart, GamePartSchema, GameRound, GameRoundSchema, GameWinner, GameWinnerCriteria, GameWinnerCriteriaSchema, GameWinnerSchema, PlayerGameRegistration, PlayerGameRegistrationSchema } from "./models";
import { CompetitionGameService, GameArcardeService } from "./services";

@Module({
    controllers:[],
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
        GameArcardeService
    ],
    exports:[CompetitionGameService,GameArcardeService]
})
export class GameModule{}