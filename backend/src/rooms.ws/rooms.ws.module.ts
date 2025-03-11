import { Module } from "@nestjs/common"
import { RoomsWsGateway } from "./rooms.ws.gateway"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Room } from "src/rooms/rooms.entity"
import { TokensModule } from "src/tokens/tokens.module"
import { Role } from "src/roles/roles.entity"
import { User } from "src/users/users.entity"

@Module({
    imports: [TypeOrmModule.forFeature([Room, Role, User]), TokensModule],
    providers: [RoomsWsGateway],
    exports: [RoomsWsGateway],
})
export class RoomsWsModule {}
