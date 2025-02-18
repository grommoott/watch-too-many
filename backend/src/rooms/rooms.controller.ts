import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/tokens/auth.guard";
import { IRoom } from "./interfaces/room.interface";
import { CreateRoomDto } from "./dto/createRoom.dto";

@Controller("rooms")
export class RoomsController {
    @UseGuards(AuthGuard)
    @Post("create")
    async create(@Body() createRoomDto: CreateRoomDto): Promise<IRoom> {
        console.log(createRoomDto.user)

        return { name: "f" }
    }
}
