import {  IsEmail, isNotEmpty } from "class-validator";
import { IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    username: string;
    @IsEmail()
    email: string;
    @IsNotEmpty()
    password: string;
}