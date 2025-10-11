import { Body, Controller, Get, Post, Req, UsePipes } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common/pipes";
import { UserService } from "./user.service";
import { CreateUserDto } from "./DTO/createUser.dto";
import { promises } from "dns";
// import { IUser } from "./types/user.type";
import { IUserResponse } from "./types/userResponse.interface";
import { LoginUserDto } from "./DTO/loginUser.dto";
import { request } from "express";
import { response } from "express";

@Controller()
export class UserController {
    constructor(private readonly userService:UserService) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto) : Promise<any> {
        return await this.userService.createUser(createUserDto);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async loginUser(@Body('user') LoginUserDto: LoginUserDto) : Promise<IUserResponse> {
        const user = await this.userService.loginUser(LoginUserDto.email);
        return this.userService.generateUserResponse(user);
    }

    @Get('users')
    async getCurrentUser(@Req() request : Request) : Promise<IUserResponse> {
        // return await this.userService.getAllUsers();
        // this method should return nothing
        return this.userService.generateUserResponse(request.user);
    }
}