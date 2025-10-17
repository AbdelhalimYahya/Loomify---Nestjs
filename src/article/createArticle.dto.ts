import { IsArray , IsNotEmpty , IsString } from "class-validator";

export class CreateArticleDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;
    
    @IsNotEmpty()
    @IsString()
    readonly description: string;
    
    @IsNotEmpty()
    @IsString()
    readonly body: string;
    
    @IsArray()
    @IsString({each: true})
    readonly tagList: string[];
}