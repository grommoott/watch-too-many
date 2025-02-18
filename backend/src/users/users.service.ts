import { ForbiddenException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { HashService } from "src/helpers/hash.service";
import { ForbiddenErrors } from "src/errors";
import { IUser } from "./interfaces/user.interface";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>, private hashService: HashService) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        if (await this.userRepository.findOneBy({ name: createUserDto.name }) != null) {
            throw new ForbiddenException(ForbiddenErrors.UserAlreadyExists)
        }

        const user = new User()
        user.name = createUserDto.name
        user.passwordHash = await this.hashService.hash(createUserDto.password)

        return this.userRepository.save(user)
    }

    async get(name: string): Promise<IUser | null> {
        const user = await this.userRepository.findOneBy({ name })

        if (user != null) {
            return { name: user.name }
        } else {
            return null
        }
    }
}

