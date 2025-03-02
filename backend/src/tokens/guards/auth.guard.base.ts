import { CanActivate, ExecutionContext } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { User } from "src/users/users.entity"
import { Repository } from "typeorm"

export abstract class AuthGuardBase implements CanActivate {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) {}

    abstract getUnauthorizedException(): Error

    abstract getAccessToken(context: ExecutionContext): string

    abstract setUserInBody(context: ExecutionContext, user: User): void

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = this.getAccessToken(context)

        try {
            const payload = await this.jwtService.verifyAsync(token)

            if (!payload || !payload.name || payload.typ != "access") {
                throw new Error()
            }

            const user = await this.userRepository.findOneBy({
                name: payload.name,
            })

            if (!user) {
                throw new Error()
            }

            this.setUserInBody(context, user)
        } catch (e) {
            throw this.getUnauthorizedException()
        }

        return true
    }
}
