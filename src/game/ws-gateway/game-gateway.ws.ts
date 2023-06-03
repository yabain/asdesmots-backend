import { WebSocketGateway, SubscribeMessage, MessageBody } from "@nestjs/websockets";

@WebSocketGateway({namespace:'asdesmots'})
export class GameGatewayWS
{

    @SubscribeMessage('start-game')
    async startGame(@MessageBody() message)
    {

    }
}