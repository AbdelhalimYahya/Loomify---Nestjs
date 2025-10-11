import { IsEmail } from "class-validator";
import { IsNotEmpty } from "class-validator";
import { IsString } from "class-validator";

export class LoginUserDto {
    @IsEmail()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    readonly password: string
}