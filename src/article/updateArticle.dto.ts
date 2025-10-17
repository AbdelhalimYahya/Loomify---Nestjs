import { IsNotEmpty , IsOptional , IsString } from "class-validator";

export class UpdateArticleDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty({message: 'Title cannot be an empty string'})
    title: string

    @IsString()
    @IsOptional()
    description: string

    @IsString()
    @IsOptional()
    body: string
}