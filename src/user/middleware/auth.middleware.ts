import { Injectable } from "@nestjs/common";
import { NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { Request, Response } from "express";
import { UserService } from "../user.service";
import { AuthRequest } from "@/types/expressRequest.interface";
import { varify } from "jsonwebtoken";
import { UserEntity } from "../user.entity";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}
    async use(req: AuthRequest, res: Response, next: NextFunction) {
        console.log(req.headers.authorization);
        this.userService.findById(9);

        if (!req.headers.authorization) {
            // The userEntity must be return a valid 
            req.user = new UserEntity();
            next(); // Also here ?
            return;
        }

        const token = req.headers.authorization.split(' ')[1];
        
        try {
            const decode = varify(token, process.env.JWT_SECRET);
            const user = await this.userService.findById(decode.id);
            req.user = user;

            next();
        } catch (error) {
            req.user = new UserEntity();
            next(); // next in the catch error how ti could be ? supposed to be in the try part this is line edited by AI
        }
    }
}