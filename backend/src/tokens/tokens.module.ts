import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Tokens } from "./tokens.entity";
import { TokensService } from "src/tokens/tokens.service";
import { TokensController } from "src/tokens/tokens.controller";
import { User } from "src/users/users.entity";
import { HelpersModule } from "src/helpers/helpers.module";
import { GlobalJwtModule } from "src/globalModules/jwt.module";
import { AuthGuard } from "./auth.guard";

@Module({
    imports: [
        TypeOrmModule.forFeature([Tokens, User]),
        HelpersModule,
        GlobalJwtModule
    ],
    providers: [TokensService, AuthGuard],
    controllers: [TokensController],
    exports: [AuthGuard]
}) export class TokensModule { }
