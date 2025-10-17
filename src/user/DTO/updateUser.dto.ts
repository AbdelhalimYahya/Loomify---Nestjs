import { IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    readonly username: string;
    @IsString()
    readonly email: string;
    @IsString()
    readonly bio: string;
    @IsString()
    readonly image: string;
}