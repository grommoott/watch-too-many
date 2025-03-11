import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WsException,
} from "@nestjs/websockets"
import { WebSocket } from "http"
import { Room } from "src/rooms/rooms.entity"
import { Repository } from "typeorm"
import { ChangeStateDto } from "./dto/changeState.dto"
import { AuthWsGuard } from "src/tokens/guards"
import { Role } from "src/roles/roles.entity"
import { SubscribeDto } from "./dto/subscribe.dto"
import { UserInRoomGuard } from "./guards/userInRoom.guard"
import { UnsubscribeDto } from "./dto/unsubscribe.dto"
import { IChangeState } from "./interfaces/changeState.interface"
import { User } from "src/users/users.entity"

@UsePipes(
    new ValidationPipe({ exceptionFactory: (error) => new WsException(error) }),
)
@WebSocketGateway(8080, { cors: { origin: "*" } })
export class RoomsWsGateway {
    constructor(
        @InjectRepository(Room) private roomsRepository: Repository<Room>,
        @InjectRepository(Role) private rolesRepository: Repository<Role>,
    ) {}

    private roomClients: Map<string, Map<string, WebSocket>> = new Map()

    private broadcast(roomName: string, from: User, data: any, event: string) {
        const room = this.roomClients.get(roomName)

        if (!room) {
            return
        }

        for (const [username, client] of room.entries()) {
            if (username == from.name) {
                break
            }

            client.send(JSON.stringify({ event, data }))
        }
    }

    @UseGuards(AuthWsGuard, UserInRoomGuard)
    @SubscribeMessage("subscribe")
    async subscribe(
        @MessageBody() body: SubscribeDto,
        @ConnectedSocket() client: WebSocket,
    ) {
        if (!this.roomClients.has(body.roomName)) {
            this.roomClients.set(body.roomName, new Map())
        }

        this.roomClients.get(body.roomName)?.set(body.user.name, client)

        client.addEventListener("close", () => {
            if (!this.roomClients.has(body.roomName)) {
                return
            }

            this.roomClients.get(body.roomName)?.delete(body.user.name)
        })
    }

    @UseGuards(AuthWsGuard, UserInRoomGuard)
    @SubscribeMessage("unsubscribe")
    async unsubscribe(@MessageBody() body: UnsubscribeDto) {
        if (!this.roomClients.has(body.roomName)) {
            return
        }

        this.roomClients.get(body.roomName)?.delete(body.user.name)
    }

    @UseGuards(AuthWsGuard, UserInRoomGuard)
    @SubscribeMessage("changeState")
    async changeState(@MessageBody() body: ChangeStateDto) {
        const response: IChangeState = {
            newState: body.newState,
            newTime: body.newTime,
            roomName: body.roomName,
            userName: body.user.name,
        }

        this.broadcast(
            body.roomName,
            body.user,
            response,
            "broadcastChangeState",
        )
    }
}
