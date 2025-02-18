import { RoomState } from "../enums/roomState.enum"
import { IRole } from "src/roles/interfaces/role.interface"

export interface IRoom {
    name: string
    state: RoomState
    roles: IRole[]
    time: number
}
