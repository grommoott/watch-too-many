import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common"
import { AuthGuard } from "src/tokens/auth.guard"
import { IRoom } from "./interfaces/room.interface"
import { CreateRoomDto } from "./dto/createRoom.dto"
import { RoomsService } from "./rooms.service"
import { User } from "src/users/users.entity"
import { JoinRoomDto } from "./dto/joinRoomDto"

@Controller("rooms")
export class RoomsController {
    constructor(private roomsService: RoomsService) {}

    @UseGuards(AuthGuard)
    @Post("create")
    async create(@Body() createRoomDto: CreateRoomDto): Promise<IRoom> {
        return await this.roomsService.createRoom(createRoomDto)
    }

    @UseGuards(AuthGuard)
    @Get("list")
    async list(@Body("user") user: User): Promise<IRoom[]> {
        return await this.roomsService.getRooms(user)
    }

    @UseGuards(AuthGuard)
    @Get(":name")
    async get(
        @Body("user") user: User,
        @Param("name") name: string,
    ): Promise<IRoom> {
        return await this.roomsService.getRoom(user, name)
    }

    @UseGuards(AuthGuard)
    @Put("join")
    async join(@Body() joinRoomDto: JoinRoomDto) {
        return await this.roomsService.join(joinRoomDto)
    }
}
