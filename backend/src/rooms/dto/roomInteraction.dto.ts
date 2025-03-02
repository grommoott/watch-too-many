import { IsString } from "class-validator"
import { User } from "src/users/users.entity"

export class RoomInteractionDto {
    user: User

    @IsString()
    name: string
}
