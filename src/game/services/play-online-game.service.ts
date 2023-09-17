import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Socket } from 'socket.io'
import { GameState } from "../enum";
import { CompetitionGame, GamePart, GameRound, PlayerGameRegistration } from "../models";
import { CompetitionGameService } from "./competition-game.service";
import { JoinGameDTO } from "../dtos";
import { ObjectId } from "mongoose";
import { PlayerGameRegistrationService } from "./player-game-registration.service";
import { GamePartService } from "./game-part.service";
import { UtilsFunc } from "src/shared/utils/utils.func";
import { GameRoundService } from "./game-round.service";
import { GameLevelService } from "src/gamelevel/services";


@Injectable()
export class PlayOnlineGameService
{
    games:Map<ObjectId,
        {
            competition:CompetitionGame,
            players:{
                player:PlayerGameRegistration,
                client:Socket
            }[],
            gameParts:Map<ObjectId,GamePart>,
            currentGamePartID:ObjectId,
            currentPlayerIndex:number,
            gameRound:GameRound,
            playingPlayID?:string,
            gameGlobalState:GameState
        }>=new Map();

    constructor(private gameCompetitionService:CompetitionGameService,private playerGameRegistration:PlayerGameRegistrationService,
          private gamePartService:GamePartService,
          private gameRoundService:GameRoundService,
          private gameLevelService:GameLevelService){}

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
                currentPlayerIndex:-1,
                gameRound:null,
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
    getListOfClients()
    {
        return Array.from(this.games.values()).map((games)=>games.players).reduce((prev,curr)=>[...prev,...curr.map((clt)=>clt.client)],[]);
    }

    getListOfPlayerRegistration()
    {
        return Array.from(this.games.values()).map((g)=>g.players).reduce((prev,curr)=>[...prev,...curr.map((client)=>client.player)],[]);
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

    async endPart(gamePartID:ObjectId,competitionID:ObjectId)
    {
        let gamePart = await this.gamePartService.findOneByField({_id:gamePartID});
        if(!gamePart) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart',
            message:[`Game part not found`]
        })

        gamePart.gameState=GameState.END;
        gamePart.endDate=new Date()
        await gamePart.update();
        let foundGamePart = this.games.get(competitionID).gameParts.get(gamePartID);
        foundGamePart.gameState=GameState.END;
        foundGamePart.startDate=gamePart.startDate;
        UtilsFunc.emitMessage("game-statechange",
                {gameState:GameState.END},this.getListOfClients()
            )
        return { gameState:GameState.END }
    }

    
    async getNexPlayerWithWordAndLevel(competitionID)
    {
        //ici on doit selectionner le projet joeur, a jouer, le projet mot en fonction du type de compétition 
        //et du niveau dumot
        
        //Selection du projet joueur
        let competition = this.games.get(competitionID);
        let gamePart = competition.gameParts.get(competition.currentGamePartID);
        let gameRound=competition.gameRound;
        competition.currentPlayerIndex++;

        //Si c'est le dernier joueur du round
        if(competition.currentPlayerIndex==competition.players.length)
        {
            //on a terminer ce round

            //si c'est le dernier round On termine la partie
            if(gamePart.gameRound.length-1==gameRound.step) 
                return this.endPart(gamePart.id,competition.competition.id) 
            else{
                //si c'est pas le dernier Round alors on démarre un nouveau
                let newGameRound = this.gameRoundService.createInstance({
                    step:gameRound.step+1                    
                })
                newGameRound.gameLevel = await this.processNewGameLevel(competitionID,gamePart.id,newGameRound)
                await newGameRound.save()
            }
        }
        /**
         *  {
            competition:CompetitionGame,
            players:{
                player:PlayerGameRegistration,
                client:Socket
            }[],
            gameParts:Map<ObjectId,GamePart>,
            currentGamePartID:ObjectId,
            currentPlayerIndex:number,
            gameRound:GameRound,
            playingPlayID?:string,
            gameGlobalState:GameState
        }
         */
    }

    //On détecte le niveau du jeu
    async processNewGameLevel(competitionID,gamePartID,gameRound:GameRound)
    {
        let competition = this.games.get(competitionID);
        let gamePart = this.games.get(competitionID).gameParts.get(gamePartID);
        if(competition.competition.isSinglePart && gameRound.step%2==0 && gameRound.step==0)
        {
            let newGameLevel = await this.gameLevelService.findOneByField({
                level: gameRound.gameLevel.level+1
            });
            if(newGameLevel) return newGameLevel
        }
        return gameRound.gameLevel;
    }
}