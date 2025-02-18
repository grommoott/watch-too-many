import { IsString, Length } from "class-validator";
import { RoomInteractionDto } from "./roomInteraction.dto";

export class CreateRoomDto extends RoomInteractionDto {
    @IsString()
    @Length(1, 60)
    name: string

    @IsString()
    @Length(0, 64)
    password: string
}
