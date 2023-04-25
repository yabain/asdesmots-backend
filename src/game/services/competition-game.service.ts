import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import { DataBaseService } from "src/shared/services/database";
import mongoose, { Model } from "mongoose";
import { CompetitionGame, CompetitionGameDocument } from "../models";
import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCompetitionGameDTO, UpdateGameCompetitionGameDTO } from "../dtos";
import { UsersService } from "src/user/services";
import { GameWinnerCriteriaService } from "./game-winner-criteria.service";

@Injectable()
export class CompetitionGameService extends DataBaseService<CompetitionGameDocument>
{
    constructor(
        @InjectModel(CompetitionGame.name) competitionGameModel: Model<CompetitionGameDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private usersService:UsersService,
        private gameWinnerCriteriaService:GameWinnerCriteriaService
        ){
            super(competitionGameModel,connection);
    }  

    async createNewCompetition(createCompetitionGameDTO:CreateCompetitionGameDTO)
    {
        let judge = null,parentCompetition = null, gamesCriteria = [];
        if(createCompetitionGameDTO.gameJudgeID)
        {
            judge= await this.usersService.findOneByField({"_id":createCompetitionGameDTO.gameJudgeID})
            if(!judge) throw new NotFoundException({
                statusCode:HttpStatus.NOT_FOUND,
                error:'NotFound/GameCompetition-Judge',
                message:[`Judge of the competition not found`]
            })
        }

        if(createCompetitionGameDTO.parentCompetition)
        {
            parentCompetition = await this.findOneByField({"_id":createCompetitionGameDTO.parentCompetition});
            if(!parentCompetition) throw new NotFoundException({
                statusCode:HttpStatus.NOT_FOUND,
                error:'NotFound/GameCompetition-ParentCompetition',
                message:[`Parent competition not found`]
            })
        }

        if(createCompetitionGameDTO.gameWinnerCriterias)
        {
            gamesCriteria = await createCompetitionGameDTO.gameWinnerCriterias.map((criteriaID)=> this.gameWinnerCriteriaService.findOneByField({"_id":criteriaID}))
            gamesCriteria.forEach((criteria)=>{
                if(!criteria) throw new NotFoundException({
                    statusCode:HttpStatus.NOT_FOUND,
                    error:'NotFound/GameCompetition-WinnerCompetition',
                    message:[`A winning criterion of the competition is not found`]
                })
            })
        }

        return this.create({
            ...createCompetitionGameDTO,
            gameJudge:judge,
            parentCompetition,
            gameWinnerCriterias: gamesCriteria
        })

    }

    async updateCompetition(updateCompetitionGameDTO:UpdateGameCompetitionGameDTO,competitionGameID:String)
    {
        let competition = await this.findOneByField({"_id":competitionGameID}), parentCompetition=null, judge=null,gamesCriteria =null;
        if(!competition) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GameCompetition-competition',
            message:[`Game competition not found`]
        })

        if(updateCompetitionGameDTO.parentCompetition)
        {
            parentCompetition = await this.findOneByField({"_id":updateCompetitionGameDTO.parentCompetition});
            if(!parentCompetition) throw new NotFoundException({
                statusCode:HttpStatus.NOT_FOUND,
                error:'NotFound/GameCompetition-ParentCompetition',
                message:[`Parent competition not found`]
            })

            if(competition.parentCompetition && competition.parentCompetition.id!=parentCompetition.id) competition.parentCompetition = parentCompetition;
        }


        if(updateCompetitionGameDTO.gameJudgeID)
        {
            judge= await this.usersService.findOneByField({"_id":updateCompetitionGameDTO.gameJudgeID})
            if(!judge) throw new NotFoundException({
                statusCode:HttpStatus.NOT_FOUND,
                error:'NotFound/GameCompetition-Judge',
                message:[`Judge of the competition not found`]
            })

            if(competition.gameJudge && competition.gameJudge.id!=judge.id) competition.gameJudge = judge
        }

        if(updateCompetitionGameDTO.gameWinnerCriterias)
        {
            gamesCriteria = await updateCompetitionGameDTO.gameWinnerCriterias.map((criteriaID)=> this.gameWinnerCriteriaService.findOneByField({"_id":criteriaID}))
            gamesCriteria.forEach((criteria)=>{
                if(!criteria) throw new NotFoundException({
                    statusCode:HttpStatus.NOT_FOUND,
                    error:'NotFound/GameCompetition-WinnerCompetition',
                    message:[`A winning criterion of the competition is not found`]
                })
            })

            competition.gameWinnerCriterias = gamesCriteria;
        }
        
        return competition.update({
            ...updateCompetitionGameDTO,
            gameJudge:judge,
            parentCompetition,
            gameWinnerCriterias: gamesCriteria
        })


    }
    
} 