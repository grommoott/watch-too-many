import { IUser } from "src/users/interfaces/user.interface";
import { RoleEnum } from "../enums/role.enum";

export interface IRole {
    role: RoleEnum
    user: IUser
}
