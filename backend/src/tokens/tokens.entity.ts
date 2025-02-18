import { User } from "src/users/users.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tokens {
    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar")
    access: string

    @Column("varchar")
    refresh: string

    @OneToOne(() => User, (user) => user.tokens)
    @JoinColumn()
    user: User
}
