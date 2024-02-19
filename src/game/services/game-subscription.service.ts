import { BadRequestException, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { DataBaseService } from "src/shared/services/database";
import { UsersService } from "src/user/services";
import { PlayerSubscriptionDTO, PlayerUnSubscriptionDTO } from "../dtos";
import { PlayerGameRegistration, PlayerGameRegistrationDocument } from "../models";
import { GameArcardeService } from "./game-arcarde.service";
import { PlayerGameRegistrationService } from "./player-game-registration.service";

@Injectable()
export class GameSubscriptionService extends DataBaseService<PlayerGameRegistrationDocument>
{
    constructor(
        @InjectModel(PlayerGameRegistration.name) gameArcardeModel: Model<PlayerGameRegistrationDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private gameArcardeService:GameArcardeService,
        private userService:UsersService,
        private playerGameRegistrationService:PlayerGameRegistrationService
    ){
        super(gameArcardeModel,connection,[]);
    }

    async addGameArcardeSubscription(gameSubscriptionDTO:PlayerSubscriptionDTO)
    {
        let game = await this.gameArcardeService.findOneByField({_id:gameSubscriptionDTO.gameID});
        if(!game) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GameArcarde-subscription',
            message:[`Game arcarde not found`]
        })

        if(!game.canRegisterPlayer) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'UnableSubscription/GameArcarde-subscription',
            message:[`Unable to subscribe the player to the game`]
        })

        if(!game.isFreeRegistrationPlayer) throw new ServiceUnavailableException({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            error:'ServiceNotFound/GameArcarde-subscription',
            message:[`Paid games not yet supported.`]
        })

        if(game.maxPlayersNumber<=game.playerGameRegistrations.length) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'MaxPlayer/GameArcarde-subscription',
            message:[`Maximum number of players already reached`]
        })

        let player = await this.userService.findOneByField({_id:gameSubscriptionDTO.playerID});
        if(!player) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/PlayerGame-subscription',
            message:[`Player not found`]
        })
        let foundPlayer = game.playerGameRegistrations.findIndex((pl)=> pl.player._id.toString()==gameSubscriptionDTO.playerID)
        if(foundPlayer>=0) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'AlreadyExists/GameArcarde-subscription',
            message:[`Player already subscribed to the game`]
        })
        if(game.startRegistrationDate>(new Date()) || game.endRegistrationDate<(new Date()) ) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'DateRegistration/GameArcarde-subscription',
            message:[`Unable to register player for this game because player registration date is not allowed for this game`]
        })

        return this.executeWithTransaction(async (session)=>{
            let gameSubscription = await this.playerGameRegistrationService.create({player,localisation:gameSubscriptionDTO.localisation},session);
            let playerSubscription = await this.gameArcardeService.addSubscription(gameSubscription,game,session)
            game.playerGameRegistrations.push(gameSubscription);

            let gameCompetition = game.competitionGames.find((competition)=>competition.localisation==gameSubscriptionDTO.localisation)
            if(!gameCompetition) throw  new NotFoundException({
                statusCode:HttpStatus.NOT_FOUND,
                error:'NotFound/CompetitionGame-subscription',
                message:[`Location-based gaming competition not found`]
            })
            gameSubscription.competition=gameCompetition;
            await gameCompetition.save({session});
            await game.save({session});
            return playerSubscription;
        })

    }

    async removeGameArcardeSubscription(gameSubscriptionDTO:PlayerUnSubscriptionDTO)
    {
        let game = await this.gameArcardeService.findOneByField({_id:gameSubscriptionDTO.gameID});
        if(!game) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GameArcarde-unsubscription',
            message:[`Game arcarde not found`]
        })


        let player = await this.userService.findOneByField({_id:gameSubscriptionDTO.playerID});
        if(!player) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/PlayerGame-unsubscription',
            message:[`Player not found`]
        })

        let foundPlayer = game.playerGameRegistrations.findIndex((player)=>player.player._id==gameSubscriptionDTO.playerID)
        if(foundPlayer<0) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'NotFound/PlayerGameRegistration-unsubscription',
            message:[`Player subscription not found`]
        })


        return this.executeWithTransaction(async (session)=>{
            await this.gameArcardeService.removeSubscription(game.playerGameRegistrations[foundPlayer],game,session)
            this.playerGameRegistrationService.delete({_id:game.playerGameRegistrations[foundPlayer].id})
            game.playerGameRegistrations.splice(foundPlayer,1);
            return game.save({session});

        })
    }

    async addGameCompetitionSubscription()
    {

    }

    async removeGameCompetitionSubscription()
    {

    }
}