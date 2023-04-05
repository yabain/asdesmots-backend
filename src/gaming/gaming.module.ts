import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose";
import { LottoGame, LottoGameSchema } from "./models";
import { GamingService } from "./services";

@Module({
    controllers:[],
    imports:[
        MongooseModule.forFeature([
            {name:LottoGame.name,schema:LottoGameSchema},
        ]),
    ],
    providers:[
        GamingService
    ],
    exports:[GamingService]
})
export class GamingModule{}