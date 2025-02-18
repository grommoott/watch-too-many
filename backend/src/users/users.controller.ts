import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post("create")
    async create(@Body() createUserDto: CreateUserDto) {
        await this.usersService.create(createUserDto)
    }

    @Get(":name")
    async get(@Param("name") name: string) {
        return await this.usersService.get(name)
    }
}
