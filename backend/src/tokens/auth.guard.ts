import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { User } from "src/users/users.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService,
        @InjectRepository(User) private userRepository: Repository<User>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>()

        const auth = request.header("Authorization")?.split(" ")

        if (!auth || auth.length != 2 || auth[0] != "Bearer") {
            throw new UnauthorizedException()
        }

        const token = auth[1]

        try {
            const payload = await this.jwtService.verifyAsync(token)

            if (!payload || !payload.name || payload.typ != "access") {
                throw new Error()
            }

            const user = await this.userRepository.findOneBy({ name: payload.name })

            if (!user) {
                throw new Error()
            }

            if (!request.body) {
                request.body = {}
            }

            request.body.user = user
        } catch (e) {
            throw new UnauthorizedException()
        }


        return true
    }

}
