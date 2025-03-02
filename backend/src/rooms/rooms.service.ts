import {
    ConflictException,
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
import { LeaveRoomDto } from "./dto/leaveRoomDto"
import { EditRoomDto } from "./dto/editRoomDto"

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
        const room = await this.roomsRepository.findOne({
            where: { name: joinRoomDto.name },
            relations: { roles: { user: true } },
        })

        if (room == null) {
            throw new NotFoundException()
        }

        if (
            !(await this.hashService.compare(
                joinRoomDto.password,
                room.passwordHash,
            ))
        ) {
            throw new ForbiddenException()
        }

        if (
            room.roles.findIndex(
                (role) => role.user.name == joinRoomDto.user.name,
            ) != -1
        ) {
            throw new ConflictException()
        }

        const role = new Role()
        role.role = Roles.User
        role.user = joinRoomDto.user
        role.room = room

        if (room.roles.length == 0) {
            role.role = Roles.Admin
        }

        await this.rolesRepository.save(role)
    }

    async leave(leaveRoomDto: LeaveRoomDto) {
        const role = await this.rolesRepository.findOne({
            where: {
                room: { name: leaveRoomDto.name },
                user: leaveRoomDto.user,
            },
        })

        if (role == null) {
            throw new NotFoundException()
        }

        await this.rolesRepository.remove([role])

        if (role.role != Roles.Admin) {
            return
        }

        const adminRoles = await this.rolesRepository.find({
            where: {
                room: { name: leaveRoomDto.name },
            },
        })

        if (adminRoles.length != 0) {
            return
        }

        const randomRole = await this.rolesRepository.findOne({
            where: {
                room: { name: leaveRoomDto.name },
            },
        })

        if (randomRole == null) {
            return
        }

        randomRole.role = Roles.Admin
        this.rolesRepository.save(randomRole)
    }

    async edit(editRoomDto: EditRoomDto) {
        const adminRole = await this.rolesRepository.findOne({
            where: {
                room: { name: editRoomDto.name },
                role: Roles.Admin,
                user: editRoomDto.user,
            },
        })

        if (!adminRole) {
            throw new ForbiddenException()
        }

        const room = await this.roomsRepository.findOne({
            where: {
                name: editRoomDto.name,
            },
            relations: {
                roles: { user: true },
            },
        })

        if (!room) {
            throw new NotFoundException()
        }

        const passwordHash = await (() => {
            if (editRoomDto.newPassword) {
                return this.hashService.hash(editRoomDto.newPassword)
            }
        })()

        const roles = await (async () => {
            if (!editRoomDto.newRoles) {
                return
            }

            const roles = await this.rolesRepository.remove(room.roles)
            const newRoles: Role[] = []

            try {
                const rolePromises = editRoomDto.newRoles
                    .filter(
                        (newRole) =>
                            room.roles.findIndex(
                                (role) => role.user.name == newRole.user.name,
                            ) != -1,
                    )
                    .map((val) => {
                        const role = new Role()
                        role.user = new User()
                        role.user.name = val.user.name
                        role.role = val.role
                        role.room = room

                        return this.rolesRepository.save(role)
                    })

                await Promise.all(rolePromises)

                for (const promise of rolePromises) {
                    newRoles.push(await promise)
                }
            } catch (e) {
                this.rolesRepository.save(roles)
                throw e
            }

            return newRoles
        })()

        room.passwordHash = passwordHash || room.passwordHash
        room.roles = roles || room.roles

        await this.roomsRepository.save(room)
        await this.roomsRepository.update(
            { name: room.name },
            { name: editRoomDto.newName || room.name },
        )
    }
}
