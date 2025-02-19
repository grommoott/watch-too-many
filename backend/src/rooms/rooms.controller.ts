import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { AuthGuard } from "src/tokens/auth.guard"
import { IRoom } from "./interfaces/room.interface"
import { CreateRoomDto } from "./dto/createRoom.dto"
import { RoomsService } from "./rooms.service"
import { User } from "src/users/users.entity"

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
}
