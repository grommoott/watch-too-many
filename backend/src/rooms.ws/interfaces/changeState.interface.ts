import { RoomState } from "src/rooms/enums/roomState.enum"

export interface IChangeState {
    userName: string
    roomName: string
    newState: RoomState
    newTime: number
}
