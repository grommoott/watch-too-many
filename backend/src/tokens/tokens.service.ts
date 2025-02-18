import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Tokens } from "./tokens.entity";
import { Repository } from "typeorm";
import { User } from "src/users/users.entity";
import { HashService } from "src/helpers/hash.service";
import { ITokens } from "./interfaces/tokens.interface";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokensService {
    readonly accessTokenLifetime: number = 1200
    readonly refreshTokenLifetime: number = 604800

    constructor(@InjectRepository(Tokens) private tokensRepository: Repository<Tokens>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private hashService: HashService,
        private jwtService: JwtService) { }

    private async generate(forUser: User): Promise<ITokens> {
        const accessPayload = { name: forUser.name, exp: Math.round((new Date().getTime() / 1000 + this.accessTokenLifetime)), typ: "access" }
        const refreshPayload = { name: forUser.name, exp: Math.round((new Date().getTime() / 1000 + this.refreshTokenLifetime)), typ: "refresh" }

        return {
            access: await this.jwtService.signAsync(JSON.stringify(accessPayload)),
            refresh: await this.jwtService.signAsync(JSON.stringify(refreshPayload))
        }
    }

    async login(loginDto: LoginDto): Promise<ITokens> {
        const user = await this.userRepository.findOneBy({ name: loginDto.username })

        if (user == null) {
            throw new NotFoundException()
        }

        if (!this.hashService.compare(loginDto.password, user.passwordHash)) {
            throw new ForbiddenException()
        }

        const { access, refresh } = await this.generate(user)

        if (await this.tokensRepository.findOneBy({ user }) != null) {
            await this.tokensRepository.update({ user }, { access, refresh })
        } else {
            await this.tokensRepository.insert({ user, access, refresh })
        }

        return { access, refresh }
    }

    async refresh(refreshToken: string): Promise<ITokens> {
        if (!refreshToken) {
            throw new UnauthorizedException()
        }

        let user: User | null

        try {
            const payload = await this.jwtService.verifyAsync(refreshToken)

            if (!payload || !payload.name || payload.typ != "refresh") {
                throw new Error()
            }

            user = await this.userRepository.findOneBy({ name: payload.name })

            if (user == null) {
                throw new Error()
            }
        } catch (e) {
            throw new UnauthorizedException()
        }

        const tokens = await this.tokensRepository.find({ where: { refresh: refreshToken }, relations: { user: true } })

        if (tokens == null || tokens.length == 0) {
            throw new NotFoundException()
        }

        const { access, refresh } = await this.generate(tokens[0].user)
        this.tokensRepository.update(tokens[0], { access, refresh })

        return { access, refresh }
    }
}
