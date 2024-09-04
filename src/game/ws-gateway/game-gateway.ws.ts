import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Socket } from 'socket.io'
import { GameStartDTO, JoinGameDTO, PlayGameDTO } from "../dtos";
import { PlayOnlineGameService } from "../services/";
import { ForbiddenException } from "@nestjs/common";

@WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
export class GameGatewayWS
{
    constructor(private playGameService:PlayOnlineGameService){}

    @SubscribeMessage('start-game-part')
    async startGame(@MessageBody() gamePart:GameStartDTO,@ConnectedSocket() client:Socket)
    {
        try {
            client.emit("start-game-part",await this.playGameService.startPart(gamePart.competitionID,gamePart.gamePartID))
        } catch (error) {
            console.log(error)
            client.emit("start-game-part-error",error)
        }
    }

    @SubscribeMessage('end-game-part')
    async endGame(@MessageBody() gamePart:GameStartDTO,@ConnectedSocket() client:Socket)
    {
        try {
            client.emit("end-game-part",await this.playGameService.endPart(gamePart.competitionID,gamePart.gamePartID))
        } catch (error) {
            client.emit("end-game-part-error",error)
        }
    }

    @SubscribeMessage('join-game') 
    async joinGame(@MessageBody() joinGameDTO:JoinGameDTO, @ConnectedSocket() client:Socket)
    {
        try {
            client.emit("join-game",await this.playGameService.joinGame(joinGameDTO,client))
        } catch (error) {
            console.log("join-game-error",error)
            client.emit("join-game-error",error)
        }
    }

    @SubscribeMessage('game-play')
    async playGame(@MessageBody() playGameDTO:PlayGameDTO, @ConnectedSocket() client:Socket)
    {
        this.playGameService.gamePlay(playGameDTO)
    }

}