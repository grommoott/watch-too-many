import { Room } from "src/rooms/rooms.entity";
import { User } from "src/users/users.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { RoleEnum } from "./enums/role.enum";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.roles)
    user: User

    @ManyToOne(() => Room, (room) => room.roles)
    room: Room

    @Column("varchar")
    role: RoleEnum
}
