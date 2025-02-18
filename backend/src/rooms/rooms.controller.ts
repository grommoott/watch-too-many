import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/tokens/auth.guard";
import { IRoom } from "./interfaces/room.interface";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { RoomsService } from "./rooms.service";

@Controller("rooms")
export class RoomsController {
    constructor(private roomsService: RoomsService) { }

    @UseGuards(AuthGuard)
    @Post("create")
    async create(@Body() createRoomDto: CreateRoomDto): Promise<IRoom> {
        return await this.roomsService.createRoom(createRoomDto)
    }
}
