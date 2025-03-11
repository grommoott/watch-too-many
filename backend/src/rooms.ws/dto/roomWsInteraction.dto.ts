import { IsJWT, IsString } from "class-validator"
import { User } from "src/users/users.entity"

export class RoomWsInteraction {
    @IsJWT()
    access: string

    @IsString()
    roomName: string

    user: User
}
