import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Socket } from 'socket.io'
import { GameStartDTO, JoinGameDTO } from "../dtos";
import { PlayGameService } from "../services/play.game.service";
import { ForbiddenException } from "@nestjs/common";

@WebSocketGateway({namespace:'asdesmots'})
export class GameGatewayWS
{
    constructor(private playGameService:PlayGameService){}

    @SubscribeMessage('start-game-part')
    async startGame(@MessageBody() gamePart:GameStartDTO,@ConnectedSocket() client:Socket)
    {
        try {
            client.emit("start-game-part",await this.playGameService.startPart(gamePart.competitionID,gamePart.gamePartID))
        } catch (error) {
            client.emit("start-game-part-error",error)
        }
    }

    @SubscribeMessage('join-game')
    async joinGame(@MessageBody() joinGameDTO:JoinGameDTO, @ConnectedSocket() client:Socket)
    {
        try {            
            client.emit("join-game",await this.playGameService.joinGame(joinGameDTO,client))
        } catch (error) {
            client.emit("join-game-error",error)
        }
    }
}