import { IsEnum, IsNumber } from "class-validator"
import { RoomState, RoomStates } from "src/rooms/enums/roomState.enum"
import { RoomWsInteraction } from "./roomWsInteraction.dto"

export class ChangeStateDto extends RoomWsInteraction {
    @IsEnum(RoomStates)
    newState: RoomState

    @IsNumber()
    newTime: number
}
