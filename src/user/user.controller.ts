import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common/pipes";
import { UserService } from "./user.service";
import { CreateUserDto } from "./DTO/createUser.dto";
import { IUserResponse } from "./types/userResponse.interface";
import { LoginUserDto } from "./DTO/loginUser.dto";
import { User } from "./decorators/user.decorator";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDto } from "./DTO/updateUser.dto";
import { UserEntity } from "./user.entity";

@Controller()
export class UserController {
    constructor(private readonly userService:UserService) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<IUserResponse> {
        return await this.userService.createUser(createUserDto);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async loginUser(@Body('user') loginUserDto: LoginUserDto): Promise<IUserResponse> {
        return await this.userService.loginUser(loginUserDto);
    }

    @Put('users')
    @UseGuards(AuthGuard)
    async updateUser(
        @User('id') userId: number,
        @Body('user') updateUserDto: UpdateUserDto
    ): Promise<IUserResponse> {
        return await this.userService.updateUser(userId, updateUserDto);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async getCurrentUser(@User() user: UserEntity): Promise<IUserResponse> {
        return await this.userService.getCurrentUser(user);
    }
}