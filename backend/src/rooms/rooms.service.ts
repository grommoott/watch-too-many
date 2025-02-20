import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Room } from "./rooms.entity"
import { In, Repository } from "typeorm"
import { CreateRoomDto } from "./dto/createRoom.dto"
import { IRoom } from "./interfaces/room.interface"
import { ForbiddenErrors } from "src/errors"
import { Role } from "src/roles/roles.entity"
import { HashService } from "src/helpers/hash.service"
import { Roles } from "src/roles/enums/role.enum"
import { RoomStates } from "./enums/roomState.enum"
import { User } from "src/users/users.entity"
import { JoinRoomDto } from "./dto/joinRoomDto"

@Injectable()
export class RoomsService {
    private readonly selectorIRoom = {
        roles: { role: true, user: { name: true } },
        name: true,
        state: true,
        time: true,
    }
    private readonly relationsIRoom = { roles: { user: true } }
    private readonly selectorIRole = {
        room: { name: true, state: true, time: true },
        user: { name: true },
    }
    private readonly relationsIRole = { room: true, user: true }

    constructor(
        @InjectRepository(Room) private roomsRepository: Repository<Room>,
        @InjectRepository(Role) private rolesRepository: Repository<Role>,
        private hashService: HashService,
    ) {}

    async createRoom(createRoomDto: CreateRoomDto): Promise<IRoom> {
        if (
            (await this.roomsRepository.findOneBy({
                name: createRoomDto.name,
            })) != null
        ) {
            throw new ForbiddenException(ForbiddenErrors.RoomAlreadyExists)
        }

        const role = new Role()
        role.user = createRoomDto.user
        role.role = Roles.Admin
        await this.rolesRepository.insert(role)

        let room = new Room()
        room.name = createRoomDto.name
        room.passwordHash = await this.hashService.hash(createRoomDto.password)
        room.state = RoomStates.Loading
        room.time = 0
        room.roles = [role]
        await this.roomsRepository.save(room)

        const roomWithRoles = await this.roomsRepository.findOne({
            where: { name: room.name },
            relations: this.relationsIRoom,
            select: this.selectorIRoom,
        })

        if (roomWithRoles == null) {
            throw new InternalServerErrorException()
        }

        return roomWithRoles
    }

    async getRooms(user: User): Promise<IRoom[]> {
        const rolesWithRooms = await this.rolesRepository.find({
            where: { user },
            relations: this.relationsIRole,
            select: this.selectorIRole,
        })

        return await this.roomsRepository.find({
            where: {
                name: In([...rolesWithRooms.map((role) => role.room.name)]),
            },
            relations: this.relationsIRoom,
            select: this.selectorIRoom,
        })
    }

    async getRoom(user: User, name: string): Promise<IRoom> {
        const roleWithRoom = await this.rolesRepository.findOne({
            where: { room: { name }, user },
            relations: this.relationsIRole,
            select: this.selectorIRole,
        })

        if (roleWithRoom == null) {
            throw new NotFoundException()
        }

        const room = await this.roomsRepository.find({
            where: { name: roleWithRoom.room.name },
            relations: this.relationsIRoom,
            select: this.selectorIRoom,
        })

        if (room.length == 0) {
            throw new NotFoundException()
        }

        return room[0]
    }

    async join(joinRoomDto: JoinRoomDto) {
        const room = await this.roomsRepository.findOneBy({
            name: joinRoomDto.name,
        })

        if (room == null) {
            throw new NotFoundException()
        }

        if (
            !this.hashService.compare(joinRoomDto.password, room.passwordHash)
        ) {
            throw new ForbiddenException()
        }

        const role = new Role()
        role.role = Roles.User
        role.user = joinRoomDto.user
        role.room = room

        await this.rolesRepository.save(role)
    }
}
