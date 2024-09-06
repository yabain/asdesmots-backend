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
import { UsersService } from "src/user/services";


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

    constructor(private gameCompetitionService:CompetitionGameService,
                private playerGameRegistration:PlayerGameRegistrationService,
                private gamePartService:GamePartService,
                private gameRoundService:GameRoundService,
                private gameLevelService:GameLevelService,
                private userService: UsersService){}

    async joinGame(joinGame:JoinGameDTO,client:Socket)
    {
        let gameObject = null;
        const game = await this.gameCompetitionService.findOneByField({_id:joinGame.competitionID});
        if(!this.games.has(joinGame.competitionID)) 
        {
            const gameParts:Map<string,GamePart> = new Map<string,GamePart>();
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
        else { gameObject = this.games.get(joinGame.competitionID); }
        // gameObject.players.map(gamePlayer => console.log(joinGame.playerID, gamePlayer.player._id))
        const player: PlayerGameRegistration = gameObject.players.find(gamePlayer => joinGame.playerID == gamePlayer.player._id.toString());
        if(!player) {
            const subscriber=(await this.playerGameRegistration.getPlayerSubscriber(joinGame.playerID,joinGame.competitionID));
            if(!subscriber) throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                error:'GameLocationNotFound/GameCompetition-joingame',
                message:`Unable to subscribe in this location`
            })
            
            //notification de tous les précédents joueur du nouveau arrivant
            UtilsFunc.emitMessage("new-player",{data: await this.userService.findByField({_id: joinGame.playerID})},this.getListOfClients());
            //Sauvegarde du nouveau joueur dans la liste des joueurs
            gameObject.players.push({...subscriber.toObject(), client});
        }
       
     //Si on a atteint le nombre minimum de joueur
       if(gameObject.players.length >= (game.minOfPlayers && game.playerGameRegistrations.length)) {
            //on notifie tous les joueurs que la partie a débuté
            let part = game.gameParts.find(p => p.gameState === GameState.WAITING_PLAYER);
            if(!part) throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                error:'NoPartFound/GameCompetition-joingame',
                message:`No game part found in the competition`
            })
            this.gamePartService.update(
                { _id: part._id },
                { gameState: GameState.RUNNING },
              );
            UtilsFunc.emitMessage("game-statechange",
                {gameState:GameState.RUNNING, competitionID: game._id.toString(), gamePart:part},this.getListOfClients()
            )
            this.games.get(joinGame.competitionID).gameGlobalState=GameState.RUNNING
            //On lance le jeu au premier joueur
            // UtilsFunc.emitMessage("game-play",this.getNexPlayerWithWordAndLevel(part._id),this.getListOfClients())
       }

       //notification du nouveau joueur de l'état du jeu
        return this.getListOfPlayerRegistration();
        // return player;
    }
    getListOfClients():Socket[]
    {
        return Array.from(this.games.values()).map((game)=>game.players.map((player)=>player.client)).reduce((prev,curr)=>[...prev,...curr],[]);
    }

    getListOfPlayerRegistration()
    {
        return Array.from(this.games.values()).flatMap((g) => {
            return g.players.map((client: any) => {
                return { 
                    player: {...client.player,lifeGame: client.lifeGame}, 
                    competition: g.competition 
                };
            });
        });
    }

    async startPart(competitionID:ObjectId,gamePartID:ObjectId)
    {
        let gamePart = await this.gamePartService.findOneByField({_id:gamePartID});
        if(!gamePart) throw new NotFoundException({
            statusCode:HttpStatus.NOT_FOUND,
            error:'NotFound/GamePart',
            message:`Game part not found`
        })

        let game=await this.gameCompetitionService.findOneByField({_id:competitionID});
        
        if(game.gameState!=GameState.RUNNING) throw new ForbiddenException({
            statusCode:HttpStatus.FORBIDDEN,
            error:'Forbidden/GameCompetition-joingame',
            message:`The state of the competition must be in "In Progress" state for the competition to start` 
        })

        // Vérifier l'état du jeu uniquement si la compétition est RUNNING
        if (game.gameParts.some(part => part.gameState === GameState.WAITING_PLAYER)) throw new ForbiddenException({
            statusCode:HttpStatus.FORBIDDEN,
            error:'Forbidden/GameCompetition-running',
            message:`You cannot start multiple games of the same competition simultaneously` 
        })

        if(gamePart.gameState===GameState.WAITING_PLAYER) return { gameState:GameState.WAITING_PLAYER };
        gamePart.gameState=GameState.WAITING_PLAYER;
        gamePart.startDate=new Date()
        await this.gamePartService.update({_id:gamePart._id},{gameState:GameState.WAITING_PLAYER,startDate:gamePart.startDate})

        let gameObject = {
            competition:game,
            players:[],
            gameParts:new Map<ObjectId,GamePart>(),
            currentGamePartID:null,
            currentPlayerIndex:-1,
            gameRound:null,
            currentWordGameLevel:null,
            gameGlobalState:GameState.WAITING_PLAYER
        }
        this.games.set(game.id,gameObject)

        return { gameState:GameState.WAITING_PLAYER, gameId:gamePart._id }
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
        const competition = this.games.get(competitionID);
        if(!competition.currentGamePartID) {
            competition.currentGamePartID = competition.gameParts[0]?._id
        }
        const gamePart = competition.gameParts.get(competition.currentGamePartID);
        if(!competition.gameRound)
        competition.gameRound = this.gameRoundService.createInstance({
            step:1,
            gameLevel: competition.competition.gameLevel                 
        })
        let gameRound=competition.gameRound;
        competition.currentPlayerIndex=(competition.currentPlayerIndex+1)%competition.players.length;

        //Si c'est le dernier joueur du round
        if(competition.currentPlayerIndex==competition.players.length-1)
        {
            //on a terminer ce round

            //si c'est le dernier round On termine la partie
            if((gamePart?.gameRound.length - 1) == gameRound.step) 
                return -1; 
            else{
                //si c'est pas le dernier Round alors on démarre un nouveau
                const newGameRound = this.gameRoundService.createInstance({
                    step:gameRound.step+1,
                    gameLevel:gameRound.gameLevel                   
                })
                newGameRound.gameLevel = await this.processNewGameLevel(competitionID,newGameRound.id,newGameRound)
                await newGameRound.save()
                gameRound = newGameRound;
            }
        }

        //on obtien un nouveau mot
        const wordGameLevel = this.processNewWord(gameRound.gameLevel);
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