import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Room } from "./rooms.entity";
import { RoomsService } from "./rooms.service";
import { RoomsController } from "./rooms.controller";
import { HelpersModule } from "src/helpers/helpers.module";
import { TokensModule } from "src/tokens/tokens.module";
import { Role } from "src/roles/roles.entity";
import { User } from "src/users/users.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Room, Role, User]), HelpersModule, TokensModule],
    providers: [RoomsService],
    controllers: [RoomsController]
}) export class RoomsModule { }
