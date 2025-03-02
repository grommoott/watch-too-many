import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common"
import { AuthGuardBase } from "./auth.guard.base"
import { Request } from "express"
import { User } from "src/users/users.entity"

@Injectable()
export class AuthGuard extends AuthGuardBase {
    getUnauthorizedException(): Error {
        return new UnauthorizedException()
    }

    getAccessToken(context: ExecutionContext): string {
        const request = context.switchToHttp().getRequest<Request>()

        const auth = request.header("Authorization")?.split(" ")

        if (!auth || auth.length != 2 || auth[0] != "Bearer") {
            throw this.getUnauthorizedException()
        }

        return auth[1]
    }

    setUserInBody(context: ExecutionContext, user: User): void {
        const request = context.switchToHttp().getRequest<Request>()

        if (!request.body) {
            request.body = {}
        }

        request.body.user = user
    }
}
