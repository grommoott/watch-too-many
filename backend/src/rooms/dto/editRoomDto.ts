import { IsOptional, IsString, Length } from "class-validator"
import { RoomInteractionDto } from "./roomInteraction.dto"
import { IRole } from "src/roles/interfaces/role.interface"

export class EditRoomDto extends RoomInteractionDto {
    @IsOptional()
    @IsString()
    @Length(1, 60)
    newName?: string

    @IsOptional()
    @IsString()
    @Length(0, 64)
    newPassword?: string

    @IsOptional()
    newRoles?: IRole[]
}
