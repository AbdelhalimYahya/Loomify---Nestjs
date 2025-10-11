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

    // loginUserDto is must refer to a type not the class itself
    async loginUser(LoginUserDto : string) : Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: {
                email: LoginUserDto               
            }});

        if (!user) {
            throw new HttpException("User not found" , HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // this is must compare between the LoginUserDto password and the user password (deleted the .password of the loginuserdto)
        const matchpassword = await compare(LoginUserDto, user.password);
        if (!matchpassword) {
            throw new HttpException("Password is incorrect" , HttpStatus.UNPROCESSABLE_ENTITY);
        }
        return user;
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

    generateToken(user: UserEntity): string {
        console.log(process.env.JWT_SECRET);
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET, // secret string part in the json web token structure
        )

        // const decode = verify(generatedToken, "ASDGFGF52JfddsfhddADFGA444DGsdfhg561SADAf");
        // console.log(decode);
        // return generatedToken;
    }

    generateUserResponse(user: UserEntity) : IUserResponse {
        if (!user.id) {
            throw new HttpException("User not found" , HttpStatus.UNPROCESSABLE_ENTITY);
        }
        
        return {
            user: {
                ...user,
                token: this.generateToken(user),
            },
        };
    }
}