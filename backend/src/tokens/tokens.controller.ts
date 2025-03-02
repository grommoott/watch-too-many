import { Body, Controller, Post, Req, Res } from "@nestjs/common"
import { LoginDto } from "./dto/login.dto"
import { TokensService } from "./tokens.service"
import { Request, Response } from "express"
import { ConfigService } from "@nestjs/config"
import { IAccessToken } from "./interfaces/accessToken.interface"

@Controller("tokens")
export class TokensController {
    constructor(
        private tokensService: TokensService,
        private configService: ConfigService,
    ) {}

    private setRefreshToken(refreshToken: string, response: Response) {
        response.cookie("Refresh-Token", refreshToken, {
            sameSite: true,
            httpOnly: true,
            maxAge: this.tokensService.refreshTokenLifetime * 1000,
            domain: this.configService.get("BACKEND_BASE_URL"),
            path: "/tokens/refresh",
        })
    }

    @Post("login")
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ): Promise<IAccessToken> {
        const { access, refresh } = await this.tokensService.login(loginDto)
        this.setRefreshToken(refresh, response)

        return {
            access,
        }
    }

    @Post("refresh")
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<IAccessToken> {
        const refreshToken = request.cookies["Refresh-Token"]
        const { refresh, access } =
            await this.tokensService.refresh(refreshToken)
        this.setRefreshToken(refresh, response)

        return { access }
    }
}
