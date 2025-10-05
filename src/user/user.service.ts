import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
    createUser() {
        return "User was created successfully"
    }
}