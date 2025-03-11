import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RolesModule } from "./roles/roles.module"
import { RoomsModule } from "./rooms/rooms.module"
import { TokensModule } from "./tokens/tokens.module"
import { UsersModule } from "./users/users.module"
import { Role } from "./roles/roles.entity"
import { Room } from "./rooms/rooms.entity"
import { Tokens } from "./tokens/tokens.entity"
import { User } from "./users/users.entity"
import { RoomsWsModule } from "./rooms.ws/rooms.ws.module"

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "../db.sqlite",
            synchronize: true,
            entities: [Role, Room, Tokens, User],
        }),
        ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
        RolesModule,
        RoomsModule,
        TokensModule,
        UsersModule,
        RoomsWsModule,
    ],
})
export class AppModule {}
