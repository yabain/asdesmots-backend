import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Socket } from 'socket.io'
import { GameStartDTO, JoinGameDTO, PlayGameDTO } from "../dtos";
import { PlayerGameRegistrationService, PlayOnlineGameService } from "../services/";
import { ForbiddenException } from "@nestjs/common";
import { Server } from "http";
import { GameBroadcastGatewayService } from "../services/game-broadcast-gateway.service";

@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
export class GameGatewayWS
{
    constructor(
        private playGameService:PlayOnlineGameService,
        private gameBroadcastGatewayService: GameBroadcastGatewayService,
    ){}

    @SubscribeMessage('change-game-part-state')
    async startGame(@MessageBody() gamePart:GameStartDTO,@ConnectedSocket() client:Socket)
    {
        try {
            client.emit("change-game-part-state",await this.playGameService.changeState(gamePart.competitionID,gamePart.gamePartID,gamePart.gameState))
        } catch (error) {
            console.log(error)
            client.emit("change-game-part-state-error",error)
        }
    }

    @SubscribeMessage('end-game-part')
    async endGame(@MessageBody() gamePart:GameStartDTO,@ConnectedSocket() client:Socket)
    {
        try {
            // client.emit("end-game-part",await this.playGameService.endPart(gamePart.competitionID,gamePart.gamePartID))
            this.gameBroadcastGatewayService.broadcastMessage("end-game-part",await this.playGameService.endPart(gamePart.competitionID,gamePart.gamePartID))
        } catch (error) {
            // client.emit("end-game-part-error",error)
            this.gameBroadcastGatewayService.broadcastMessage("end-game-part-error",error)
        }
    }

    @SubscribeMessage('join-game') 
    async joinGame(@MessageBody() joinGameDTO:JoinGameDTO, @ConnectedSocket() client:Socket)
    {
        try {
            // client.emit("join-game",await this.playGameService.joinGame(joinGameDTO,client))
            this.gameBroadcastGatewayService.broadcastMessage("join-game",await this.playGameService.joinGame(joinGameDTO,client))
        } catch (error) {
            // client.emit("join-game-error",error)
            this.gameBroadcastGatewayService.broadcastMessage("join-game-error",error)
        }
    }

    @SubscribeMessage('leave-game') 
    async leaveGame(@MessageBody() joinGameDTO:JoinGameDTO, @ConnectedSocket() client:Socket)
    {
        try {
            client.emit("leave-game",await this.playGameService.leaveGame(joinGameDTO))
        } catch (error) {
            client.emit("leave-game-error")
        }
    }

    @SubscribeMessage('game-play')
    async playGame(@MessageBody() playGameDTO:PlayGameDTO, @ConnectedSocket() client:Socket)
    {
        try {
            this.playGameService.gamePlay(playGameDTO)
        } catch (error) {
            // client.emit("game-play-error")
            this.gameBroadcastGatewayService.broadcastMessage("game-play-error", null)
        }
    }
}