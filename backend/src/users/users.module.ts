import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { HelpersModule } from "src/helpers/helpers.module";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

@Module({
    imports: [TypeOrmModule.forFeature([User]), HelpersModule],
    providers: [UsersService],
    controllers: [UsersController]
}) export class UsersModule { }
