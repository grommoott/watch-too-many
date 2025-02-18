import { Role } from "src/roles/roles.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { RoomState } from "./enums/roomState.enum";

@Entity()
export class Room {
    @Column()
    @PrimaryColumn("varchar")
    name: string

    @Column("varchar")
    passwordHash: string

    @Column("double")
    time: number

    @Column("varchar")
    state: RoomState

    @OneToMany(() => Role, (role) => role.room)
    roles: Role[]
}
