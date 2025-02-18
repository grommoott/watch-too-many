import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./rooms.entity";
import { User } from "src/users/users.entity";
import { Repository } from "typeorm";
import { CreateRoomDto } from "./dto/createRoom.dto";
import { IRoom } from "./interfaces/room.interface";
import { ForbiddenErrors } from "src/errors";
import { Role } from "src/roles/roles.entity";
import { HashService } from "src/helpers/hash.service";
import { Roles } from "src/roles/enums/role.enum";

@Injectable()
export class RoomsService {
    constructor(@InjectRepository(Room) private roomsRepository: Repository<Room>,
        @InjectRepository(Role) private rolesRepository: Repository<Role>,
        private hashService: HashService) { }

    async createRoom(creator: User, createRoomDto: CreateRoomDto): Promise<IRoom> {
        if (await this.roomsRepository.findOneBy({ name: createRoomDto.name }) != null) {
            throw new ForbiddenException(ForbiddenErrors.RoomAlreadyExists)
        }

        const room = new Room()
        room.name = createRoomDto.name
        room.passwordHash = await this.hashService.hash(createRoomDto.password)

        const role = new Role()
        role.room = room
        role.user = creator
        role.role = Roles.Admin
        this.rolesRepository.insert(role)

        room.roles = [role]
        this.roomsRepository.insert(room)

        return {
            name: room.name
        }
    }
}
