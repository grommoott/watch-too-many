import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from "@nestjs/common"
import { RoomWsInteraction } from "../dto/roomWsInteraction.dto"
import { InjectRepository } from "@nestjs/typeorm"
import { Role } from "src/roles/roles.entity"
import { Repository } from "typeorm"

@Injectable()
export class UserInRoomGuard implements CanActivate {
    constructor(
        @InjectRepository(Role) private rolesRepository: Repository<Role>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const body: RoomWsInteraction = context.switchToWs().getData()

        const role = await this.rolesRepository.findOne({
            where: { user: body.user, room: { name: body.roomName } },
        })

        if (!role) {
            throw new ForbiddenException()
        }

        return true
    }
}
