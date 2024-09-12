import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway()
export class GameBroadcastGatewayService {

  @WebSocketServer()
  server: Server;

  broadcastMessage(message: string, body: any) {
    this.server.emit(message, body);
  }
}
