import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { Socket } from 'socket.io'
import { GameState } from "../enum";
import { CompetitionGame, GamePart, GameRound, PlayerGameRegistration } from "../models";
import { CompetitionGameService } from "./competition-game.service";
import { JoinGameDTO, PlayGameDTO } from "../dtos";
import { ObjectId } from "mongoose";
import { PlayerGameRegistrationService } from "./player-game-registration.service";
import { GamePartService } from "./game-part.service";
import { UtilsFunc } from "src/shared/utils/utils.func";
import { GameRoundService } from "./game-round.service";
import { GameLevelService } from "src/gamelevel/services";
import { GameLevel, WordGameLevel } from "src/gamelevel/models";


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
            currentWordGameLevel:WordGameLevel,
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
                currentWordGameLevel:null,
                gameGlobalState:GameState.WAITING_PLAYER
            }
            this.games.set(game.id,gameObject)
        }
        else  gameObject = this.games.get(joinGame.competitionID);
        let player = gameObject.players.find(player => player.player.id==joinGame.playerID);
        if(!player) {
            player=await this.playerGameRegistration.findOneByField({"player.id":joinGame,localisation:joinGame.localisation,"competition.id":joinGame.competitionID});
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

            //On lance le jeu au premier joueur
            UtilsFunc.emitMessage("game-play",this.getNexPlayerWithWordAndLevel(joinGame.competitionID),this.getListOfClients())
       }

       //notification du nouveau joueur de l'état du jeu
        return {
            ...this.getListOfPlayerRegistration()
        };
    }
    getListOfClients():Socket[]
    {
        return Array.from(this.games.values()).map((game)=>game.players.map((player)=>player.client)).reduce((prev,curr)=>[...prev,...curr],[]);
    }

    getListOfPlayerRegistration():PlayerGameRegistration[]
    {
        return Array.from(this.games.values()).map((g)=>g.players.map((client)=>client.player)).reduce((prev,curr)=>[...prev,...curr],[]);
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
        //On termine la partie
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
        //ici on doit selectionner le prochain joeur, a jouer, le prochain mot en fonction du type de compétition 
        //et du niveau du mot
        
        //Selection du prochain joueur
        let competition = this.games.get(competitionID);
        let gamePart = competition.gameParts.get(competition.currentGamePartID);
        let gameRound=competition.gameRound;
        competition.currentPlayerIndex=(competition.currentPlayerIndex+1)%competition.players.length;

        //Si c'est le dernier joueur du round
        if(competition.currentPlayerIndex==competition.players.length-1)
        {
            //on a terminer ce round

            //si c'est le dernier round On termine la partie
            if(gamePart.gameRound.length-1==gameRound.step) 
                return -1; 
            else{
                //si c'est pas le dernier Round alors on démarre un nouveau
                let newGameRound = this.gameRoundService.createInstance({
                    step:gameRound.step+1                    
                })
                newGameRound.gameLevel = await this.processNewGameLevel(competitionID,gamePart.id,newGameRound)
                await newGameRound.save()
                gameRound = newGameRound;
            }
        }

        //on obtien un nouveau mot
        let wordGameLevel = this.processNewWord(gameRound.gameLevel);
        competition.currentWordGameLevel = wordGameLevel;
        return {
            gameRound,
            gameWord: wordGameLevel,
            player: competition.players[competition.currentPlayerIndex]
        }
        
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

    processNewWord(gameLevel:GameLevel):WordGameLevel
    {
        //on option le prochain mot par Random sur la liste du mot en fonction du niveau du jeu
        return gameLevel.words[Math.floor((Math.random()*(gameLevel.words.length)*100)%gameLevel.words.length)]
    }

   async gamePlay(playGameDTO:PlayGameDTO)
   {
        //On vérifie que le mot de l'utilisateur est juste
        let competition = this.games.get(playGameDTO.competitionID);
        if(UtilsFunc.purgeString(competition.currentWordGameLevel.name)!=UtilsFunc.purgeString(playGameDTO.word))
        {
            //le mot n'est pas correctement écrit


            //on doit: diminuer le nombre de vie du joueur et informer tout le monde, s'il n'a plus de vie on le rétire
            
            //On diminue le nombre de vie du joeur
            let playerRegistration = competition.players[competition.currentPlayerIndex].player;
            playerRegistration.lifeGame=playerRegistration.lifeGame==0?0:playerRegistration.lifeGame-1;

            //s'il n'a plus de vie, on informe tous les autres joueurs
            if(playerRegistration.lifeGame==0)
            {
                playerRegistration.hasLostGame=true;
                UtilsFunc.emitMessage("game-player-lifegame",
                {
                    player: competition.players[competition.currentPlayerIndex],
                    lifeGame:playerRegistration.lifeGame
                },this.getListOfClients())

                //on supprime le joueur en cours
                competition.players.splice(competition.currentPlayerIndex,1);
            }
            await playerRegistration.save();           
        }

        //on passe au joueur suivant
        let newPlayerInfos = await this.getNexPlayerWithWordAndLevel(playGameDTO.competitionID)
        if(newPlayerInfos!=-1) await this.endPart(competition.currentGamePartID,competition.competition.id)
        return newPlayerInfos
   }
}