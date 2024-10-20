import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose";
import { AuthorizationModule } from "src/authorization/authorization.module";
import { GameLevelModule } from "src/gamelevel/gamelevel.module";
import { SharedModule } from "src/shared/shared.module";
import { UserModule } from "src/user/user.module";
import { GameArcardeController, GameCompetitionController, GamePartController, GameSubscriptionController, GameWinnerCriteriaController } from "./controllers";
import { CompetitionGame, CompetitionGameSchema, GameArcarde, GameArcardeSchema, GamePart, GamePartSchema, GameRound, GameRoundSchema, GameWinner, GameWinnerCriteria, GameWinnerCriteriaSchema, GameWinnerSchema, PlayerGameRegistration, PlayerGameRegistrationSchema } from "./models";
import { CompetitionGameService, GameArcardeService, GamePartService, GameRoundService, GameWinnerCriteriaService, GameWinnerEvaluateService, PlayerGameRegistrationService,PlayOnlineGameService } from "./services";
import { GameSubscriptionService } from "./services/game-subscription.service";

import { CommandModule } from "nestjs-command";
import { AddNewGameWinnerCriterialScript } from "./scripts";
import { GameGatewayWS } from "./ws-gateway";
import { JsonResponse } from "src/shared/helpers/json-response";
import { UniqueArcadeValidator } from "./validators/arcade-unique";
import { UniqueCompetitionValidator } from "./validators/competition-unique";
import { UniqueGamePartValidator } from "./validators/game-part-unique";
import { GameBroadcastGatewayService } from "./services/game-broadcast-gateway.service";

@Module({
    controllers:[
        GameArcardeController,
        GameCompetitionController,
        GameWinnerCriteriaController,
        GamePartController,
        GameSubscriptionController
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
        GameLevelModule,
        CommandModule,
        GameBroadcastGatewayService
    ],
    providers:[
        CompetitionGameService,
        GameArcardeService,
        GameWinnerCriteriaService,
        GameSubscriptionService,
        GamePartService,
        PlayerGameRegistrationService,
        GameWinnerEvaluateService,
        AddNewGameWinnerCriterialScript,
        GameRoundService,
        PlayOnlineGameService,
        GameGatewayWS,
        JsonResponse,
        UniqueArcadeValidator,
        UniqueCompetitionValidator,
        UniqueGamePartValidator,
        GameBroadcastGatewayService
    ],
    exports:[
        CompetitionGameService,
        GameArcardeService,
        GamePartService, 
        AddNewGameWinnerCriterialScript, 
        CommandModule,
        GameRoundService
    ]
})
export class GameModule{}