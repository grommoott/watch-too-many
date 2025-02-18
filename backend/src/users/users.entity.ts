import { Role } from "src/roles/roles.entity";
import { Tokens } from "src/tokens/tokens.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @Column()
    @PrimaryColumn("varchar")
    name: string

    @Column("varchar")
    passwordHash: string

    @OneToMany(() => Role, (role) => role.user)
    roles: Role[]

    @OneToOne(() => Tokens, (tokens) => tokens.user)
    @JoinColumn()
    tokens: Tokens
}
