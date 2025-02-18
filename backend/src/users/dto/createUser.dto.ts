import { IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    @Length(1, 30)
    name: string

    @IsString()
    @Length(4, 64)
    password: string
}
