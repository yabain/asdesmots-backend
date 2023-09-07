import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Socket } from 'socket.io'
import { GameState } from "../enum";
import { CompetitionGame, GamePart, PlayerGameRegistration } from "../models";
import { CompetitionGameService } from "./competition-game.service";
import { JoinGameDTO } from "../dtos";
import { ObjectId } from "mongoose";
import { PlayerGameRegistrationService } from "./player-game-registration.service";
import { GamePartService } from "./game-part.service";
import { UtilsFunc } from "src/shared/utils/utils.func";


@Injectable()
export class PlayGameService
{
    games:Map<ObjectId,
        {
            competition:CompetitionGame,
            players:{
                player:PlayerGameRegistration,
                client:Socket
            }[],
            gameParts:Map<ObjectId,GamePart>,
            currentGamePartID:string,
            playingPlayID?:string,
            gameGlobalState:GameState
        }>=new Map();

    constructor(private gameCompetitionService:CompetitionGameService,private playerGameRegistration:PlayerGameRegistrationService, private gamePartService:GamePartService){}

    async joinGame(joinGame:JoinGameDTO,client:Socket)
    {
        let gameObject = null,game=null;
        if(!this.games.has(joinGame.competitionID)) 
        {
            game=await this.gameCompetitionService.findOneByField({_id:joinGame.competitionID});
            if(game.gameState!=GameState.RUNNING) throw new ForbiddenException({
                statusCode:HttpStatus.FORBIDDEN,
                error:'Forbidden/GameCompetition-joingame',
                message:[`The state of the competition must be in "In Progress" state for the competition to start`]  
            })
            let gameParts:Map<string,GamePart> = new Map<string,GamePart>();

            (await this.gamePartService.getListOfPartOfCompetition(joinGame.competitionID)).forEach((gamePart)=>gameParts.set(gamePart.id,gamePart))
            gameObject = {
                competition:game,
                players:[],
                gameParts,
                currentGamePartID:null,
                gameGlobalState:GameState.WAITING_PLAYER
            }
            this.games.set(game.id,gameObject)
        }
        else  gameObject = this.games.get(joinGame.competitionID);
        let player = gameObject.players.find(player => player.player.id==joinGame.playerID);
        if(!player) {
            player=await this.playerGameRegistration.findOneByField({"user.id":joinGame,localisation:joinGame.localisation});
            if(!player) throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                error:'GameLocationNotFound/GameCompetition-joingame',
                message:[`Unable to subscribe in this location`]
            })
            
            //notification de tous les précédents joueur du nouveau arrivant
            UtilsFunc.emitMessage("new-player",{},this.getListOfClients());
            
            //Sauvegarde du nouveau joueur dans la liste des joueurs
            gameObject.players.push({player,client});
        }
       
     //Si on a atteint le nombre minimum de joueur
       if(gameObject.players.length>=game.minOfPlayers) {
            //on notifie tous les joueurs que la partie a débuté
            UtilsFunc.emitMessage("game-statechange",
                {gameState:GameState.RUNNING},this.getListOfClients()
            )
            this.games.get(joinGame.competitionID).gameGlobalState=GameState.RUNNING
       }

       //notification du nouveau joueur de l'état du jeu
        return {
            ...this.getListOfPlayerRegistration()
        };
    }
    getListOfClients():Socket[]
    {
        return Array.from(this.games.values()).map((games)=>games.players)
        .reduce((prev,curr)=>[...prev,...curr.map((clt)=>clt.client)],[]);
    }

    getListOfPlayerRegistration():PlayerGameRegistration[]
    {
        return Array.from(this.games.values()).map((g)=>g.players)
        .reduce((prev,curr)=>[...prev,...curr.map((client)=>client.player)],[]);
    }

    async startPart(gamePartID:ObjectId,competitionID:ObjectId)
    {
        let gamePart = await this.gamePartService.findOneByField({_id:gamePartID});
        if(!gamePart) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart',
            message:[`Game part not found`]
        })

        let gameState = this.games.get(competitionID).gameGlobalState
        gamePart.gameState=gameState;
        gamePart.startDate=new Date()
        await gamePart.update();
        let foundGamePart = this.games.get(competitionID).gameParts.get(gamePartID);
        foundGamePart.gameState=gameState;
        foundGamePart.startDate=gamePart.startDate;
        return { gameState }
    }
}