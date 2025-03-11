import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuardBase } from "./auth.guard.base"
import { WsException } from "@nestjs/websockets"
import { WsUnauthorizedErrors } from "src/errors.ws"
import { User } from "src/users/users.entity"

@Injectable()
export class AuthWsGuard extends AuthGuardBase {
    getUnauthorizedException(): Error {
        return new WsException(WsUnauthorizedErrors.Unauthorized)
    }

    getAccessToken(context: ExecutionContext): string {
        const request = context.switchToWs().getData()

        return request.access
    }

    setUserInBody(context: ExecutionContext, user: User): void {
        const request = context.switchToWs().getData()

        request.user = user
    }
}
