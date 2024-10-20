import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { GameArcarde, GameArcardeDocument, PlayerGameRegistration } from "../models";
import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { GameState } from "../enum";
import { ChangeGameArcardeStateDTO, UpdateGameArcadeDTO } from "../dtos";
import { JsonResponse } from "src/shared/helpers/json-response";

@Injectable()
export class GameArcardeService extends DataBaseService<GameArcardeDocument>
{
    constructor(
        @InjectModel(GameArcarde.name) gameArcardeModel: Model<GameArcardeDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private jsonResponse: JsonResponse
        ){
            super(gameArcardeModel,connection,['competitionGames','competitionGames.gameWinnerCriterias','playerGameRegistrations','playerGameRegistrations.player']);
    }  

    async updateArcade(
        updateArcadeDTO: UpdateGameArcadeDTO,
        arcadeID: string,
      ) {
        let arcade = await this.findOneByField({ _id: arcadeID });
        if (!arcade)
          throw new NotFoundException({
            statusCode: HttpStatus.NOT_FOUND,
            error: 'NotFound/GameArcade-arcade',
            message: `Game arcade not found`,
          });
    
        const existsArcade = await this.findOneByField({name: updateArcadeDTO.name})
        if(existsArcade && (existsArcade?._id.toString() !== arcadeID))  {
            console.log(existsArcade?._id.toString(), arcadeID)
            throw new ConflictException(this.jsonResponse.error(`Arcade already exists`,{alreadyUsed: true}));
        }
        return arcade.update({
          ...updateArcadeDTO
        });
      }

    async changeGameArcarde( changeGameStateDTO:ChangeGameArcardeStateDTO)
    {
        let gameArcarde = await this.findOneByField({_id: changeGameStateDTO.gameArcardeID});
        if(!gameArcarde) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GameArcarde-changestate',
            message:`Game arcarde not found`   
        })
        let dateNow = new Date();
        console.log(dateNow)
        if( changeGameStateDTO.state==GameState.RUNNING && ((dateNow < gameArcarde.startDate) ||  (dateNow> gameArcarde.endDate))) throw new ForbiddenException({
            statusCode:HttpStatus.FORBIDDEN,
            error:'Forbidden/GameArcarde-changestate-start',
            message:`The current date does not correspond to the start and end date of the game`  
        })
        else if(changeGameStateDTO.state==GameState.END && dateNow< gameArcarde.endDate) throw new ForbiddenException({
            statusCode:HttpStatus.FORBIDDEN,
            error:'Forbidden/GameArcarde-changestate-end',
            message:`The current date does not correspond to the start and end date of the game`  
        })

        // gameArcarde.competitionGames
        // gameArcarde.gameState=changeGameStateDTO.state;
        // console.log("changeGameArcarde ", gameArcarde,changeGameStateDTO)
        return this.update({_id:changeGameStateDTO.gameArcardeID},{gameState:changeGameStateDTO.state}) //gameArcarde.update();
        
    } 
    async addSubscription(playerSubscription:PlayerGameRegistration,gameArcarde:GameArcarde,session=null)
    {
        let competitionGame=gameArcarde.competitionGames.find((competition)=>competition.localisation==playerSubscription.localisation);
        if(!competitionGame) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'GameLocationNotFound/GameArcarde-subscription',
            message:[`Unable to subscribe in this location`]
        })
        competitionGame.playerGameRegistrations.push(playerSubscription)
        return competitionGame.save({session})
    }

    async removeSubscription(playerSubscription:PlayerGameRegistration,gameArcarde:GameArcarde,session=null)
    {
        let competitionGameIndex=gameArcarde.competitionGames.findIndex((competition)=>competition.localisation==playerSubscription.localisation);
        if(competitionGameIndex<0) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'GameLocationNotFound/GameArcarde-unsubscription',
            message:[`Unable to unsubscribe in this location`]
        })
        
        gameArcarde.competitionGames.splice(competitionGameIndex,1)
        return gameArcarde.save({session})
    }

    async getArcardeByPagination(page:number,limit:number)
    {
        if(page==-1) return this.findAll();
        return this.findByPage({},page,limit)
    }

    async getListArcardeLocation(id:string)
    {
        let data = await this.findOneByField({"_id":id});
        if(!data) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'GameArcardeNotFound/GameArcarde',
            message:[`Game arcarde not found`]
        })

        let competitionTree:Map<string,{isLeaf:boolean,localisation:String}> = new Map();
        data.competitionGames.forEach((competion)=>{
            if(competion.parentCompetition)
                competitionTree.set(competion.parentCompetition._id.toString(),{isLeaf:false,localisation:competion.localisation})

            if(!competitionTree.has(competion._id.toString())) 
                competitionTree.set(competion._id.toString(),{isLeaf:true,localisation:competion.localisation});
          })
        return Array.from(competitionTree.entries())
            .filter((competition)=>competition[1].isLeaf==true)
            .map((competition)=> competition[1].localisation)

    }

    async getListArcardeSubscriptor(id:string)
    {
        let data = await this.findOneByField({"_id":id});
        if(!data) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'GameArcardeNotFound/GameArcarde',
            message:[`Game arcarde not found`]
        })
        return data.playerGameRegistrations
    }
} 