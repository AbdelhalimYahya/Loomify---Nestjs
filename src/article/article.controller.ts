import { User } from "@/user/decorators/user.decorator";
import { Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes } from "@nestjs/common";
import { CreateArticleDto } from "./createArticle.dto";
import { UserEntity } from "@/user/user.entity";
import { Body } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { ArticleEntity } from "./article.entity";
import { AuthGuard } from "@/user/guards/auth.guard";
import { ValidationPipe } from "@nestjs/common";
import { IArticleResponse } from "./types/articleResponse.interface";
import { IArticlesResponse } from "./types/articlesResponse.interface";

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async createArticle(
        @User() user: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto
    ): Promise<IArticleResponse> {
        return await this.articleService.createArticle(user, createArticleDto);
    }

    @Get(':slug')
    async findOne(@Param('slug') slug: string, @User('id') userId?: number): Promise<IArticleResponse> {
        return await this.articleService.getSingleArticle(slug, userId);
    }

    @Get()
    async findAllArticles(@Query() query: any, @User('id') userId?: number): Promise<IArticlesResponse> {
        return await this.articleService.findAll(query, userId);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async getUserFeed(
        @User('id') userId: number,
        @Query() query: any
    ): Promise<IArticlesResponse> {
        return await this.articleService.getFeed(userId, query);
    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    async updateArticle(
        @Param('slug') slug: string,
        @User('id') currentUserId: string,
        @Body('article') updateArticleDto: CreateArticleDto
    ) : Promise<IArticleResponse> {
        return await this.articleService.updateArticle(slug, +currentUserId, updateArticleDto);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async addToFavoriteArticle(
        @Param('slug') slug: string,
        @User('id') currentUserId: string
    ): Promise<IArticleResponse> {
        return await this.articleService.addToFavoritesArticle(slug, +currentUserId);
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async removeFromFavoriteArticle(
        @Param('slug') slug: string,
        @User('id') currentUserId: string
    ): Promise<IArticleResponse> {
        return await this.articleService.removeFromFavoritesArticle(slug, +currentUserId);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @Param('slug') slug: string,
        @User('id') currentUserId: string
    ): Promise<IArticleResponse> {
        return await this.articleService.deleteArticle(slug, +currentUserId);
    }
}