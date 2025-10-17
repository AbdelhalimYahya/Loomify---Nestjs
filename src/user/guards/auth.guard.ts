import { ExecutionContext, Injectable } from "@nestjs/common";
import { CanActivate } from "@nestjs/common";
import { Observable } from "rxjs";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AuthRequest } from "@/types/expressRequest.interface";

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest<AuthRequest>();
        
        if (request.user?.id) {
            return true;
        }
        throw new HttpException("Not authorized" , HttpStatus.UNAUTHORIZED);
    }
}