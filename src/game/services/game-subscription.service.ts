import { BadRequestException, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { InjectModel, InjectConnection } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { DataBaseService } from "src/shared/services/database";
import { UsersService } from "src/user/services";
import { PlayerSubscriptionDTO } from "../dtos";
import { PlayerGameRegistrationDocument } from "../models";
import { GameArcardeService } from "./game-arcarde.service";
import { PlayerGameRegistrationService } from "./player-game-registration.service";

@Injectable()
export class GameSubscriptionService extends DataBaseService<PlayerGameRegistrationDocument>
{
    constructor(
        @InjectModel(GameSubscriptionService.name) gameArcardeModel: Model<PlayerGameRegistrationDocument>,
        @InjectConnection() connection: mongoose.Connection,
        private gameArcardeService:GameArcardeService,
        private userService:UsersService,
        private playerGameRegistrationService:PlayerGameRegistrationService
    ){
        super(gameArcardeModel,connection);
    }

    async addGameArcardeSubscription(gameSubscriptionDTO:PlayerSubscriptionDTO)
    {
        let game = await this.gameArcardeService.findOneByField({_id:gameSubscriptionDTO.gameID});
        if(!game) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GameArcarde-subscription',
            message:[`Game arcarde not found`]
        })

        if(!game.isFreeRegistrationPlayer) throw new ServiceUnavailableException({
            statusCode: HttpStatus.SERVICE_UNAVAILABLE,
            error:'ServiceNotFound/GameArcarde-subscription',
            message:[`Paid games not yet supported.`]
        })

        if(game.maxPlayersNumber>=game.playerGameRegistrations.length) throw new BadRequestException({
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

        let foundPlayer = game.playerGameRegistrations.findIndex((player)=>player.player.id==gameSubscriptionDTO.playerID)
        if(foundPlayer>=0) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'AlreadyExists/GameArcarde-subscription',
            message:[`Player already subscribed to the game`]
        })

        return this.executeWithTransaction(async (session)=>{
            game.playerGameRegistrations.push(await this.playerGameRegistrationService.create({player},session));
            return game.save({session});
        })

    }

    async removeGameArcardeSubscription(gameSubscriptionDTO:PlayerSubscriptionDTO)
    {
        let game = await this.gameArcardeService.findOneByField({_id:gameSubscriptionDTO.gameID});
        if(!game) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GameArcarde-subscription',
            message:[`Game arcarde not found`]
        })


        let player = await this.userService.findOneByField({_id:gameSubscriptionDTO.playerID});
        if(!player) throw  new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/PlayerGame-subscription',
            message:[`Player not found`]
        })

        let foundPlayer = game.playerGameRegistrations.findIndex((player)=>player.player.id==gameSubscriptionDTO.playerID)
        if(foundPlayer<0) throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            error:'NotFound/PlayerGameRegistration-subscription',
            message:[`Player subscription not found`]
        })
        return this.executeWithTransaction((session)=>{
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