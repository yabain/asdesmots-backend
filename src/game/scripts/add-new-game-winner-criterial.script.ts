import { Injectable } from "@nestjs/common";
import { GameWinnerCriteriaService } from "../services";
import { GameWinnerCriteriaData } from "./game-winner-criterial.data";
import { UtilsFunc } from "src/shared/utils/utils.func";
import { Command,  } from "nestjs-command";


@Injectable()
export class AddNewGameWinnerCriterialScript
{
    constructor(private gameWinnerCriterialService:GameWinnerCriteriaService){

    }

    @Command({
        command:'gamewinnercriterial:updatetodb',
        describe:"Update game winner criterial to DB"
    })
    async run(passedParams: string[], options?: Record<string, any>)
    {
        return this.gameWinnerCriterialService.executeWithTransaction(async (session)=>{
            let gameWinnerCriterialInDB = await this.gameWinnerCriterialService.findAll();

            //delete winner criteria
            let gameWinnerCriterialDeleted = UtilsFunc.getWinnerCriteriaDifference(gameWinnerCriterialInDB,GameWinnerCriteriaData);
            await this.removeGameWinnerCriteriaToDB(gameWinnerCriterialDeleted)

            //add winner criteria
            let gameWinnerCriterialAdd = UtilsFunc.getWinnerCriteriaDifference(GameWinnerCriteriaData,gameWinnerCriterialInDB);
            await this.addGameWinnerCriteriaToDB(gameWinnerCriterialAdd,session);
            console.log("Update Game Winner Successfully")
            return;
        })
    }
    
    
    async addGameWinnerCriteriaToDB(gameWinnerCriteriaToAdd,session)
    {
        gameWinnerCriteriaToAdd.map((winnerCriterial)=> this.gameWinnerCriterialService.createInstance(winnerCriterial).save({session}))        
    }

    async removeGameWinnerCriteriaToDB(gameWinnerCriterialToDelete)
    {
        gameWinnerCriterialToDelete.map((winnerCriterial)=> this.gameWinnerCriterialService.update({name:winnerCriterial.name},{isDeleted:true}))
    }
}