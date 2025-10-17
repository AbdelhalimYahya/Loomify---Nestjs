import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./DTO/createUser.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { IUserResponse } from "./types/userResponse.interface";
import { sign } from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import {compare} from 'bcrypt';
import { LoginUserDto } from "./DTO/loginUser.dto";
import { response } from "express";
import { request } from "express";
import { UpdateUserDto } from "./DTO/updateUser.dto";

@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) {}
    async createUser(CreateUserDto : CreateUserDto) : Promise<IUserResponse> {
        const newUser = new UserEntity();
        Object.assign(newUser, CreateUserDto);

        const userByEmail = await this.userRepository.findOne({
            // to check the email in the data postgre the samething in express when you use the findOne method
            where: {
                email: CreateUserDto.email,
            },
        });
        if (userByEmail) {
            throw new HttpException("Email already exists" , HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const userByName = await this.userRepository.findOne({
            where: {
                username: CreateUserDto.username,
            },
        });
        if (userByName) {
            throw new HttpException("Username already exists" , HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const savedUser = await this.userRepository.save(newUser);
        return this.generateUserResponse(savedUser);
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<IUserResponse> {
        const user = await this.userRepository.findOne({
            where: {
                email: loginUserDto.email               
            }
        });

        if (!user) {
            throw new HttpException('Invalid credentials', HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const isPasswordValid = await compare(loginUserDto.password, user.password);
        
        if (!isPasswordValid) {
            throw new HttpException('Invalid credentials', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        
        return this.generateUserResponse(user);
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) : Promise<IUserResponse> {
        const user = await this.findById(id);
        Object.assign(user, updateUserDto);
        const savedUser = await this.userRepository.save(user);
        return this.generateUserResponse(savedUser);
    }

    async findById(id: number) : Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: {
                id: id,
            },
        })

        if (!user) {
            throw new HttpException("User not found" , HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return user;
    }

    async getCurrentUser(user: UserEntity): Promise<IUserResponse> {
        return this.generateUserResponse(user);
    }

    private generateToken(user: UserEntity): string {
        if (!process.env.JWT_SECRET) {
            throw new HttpException('JWT_SECRET is not defined', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
    }

    private generateUserResponse(user: UserEntity): IUserResponse {
        // if (!user.id) {
        //     throw new HttpException("User not found" , HttpStatus.UNPROCESSABLE_ENTITY);
        // }
        
        return {
            user: {
                ...user,
                token: this.generateToken(user),
            },
        };
    }
}