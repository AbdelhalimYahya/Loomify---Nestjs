import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { User } from '../user/decorators/user.decorator';
import { AuthGuard } from '../user/guards/auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserEntity } from '../user/user.entity';
import { ICommentResponse, ICommentsResponse } from './types/comment-response.interface';

@Controller('articles/:slug/comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post()
    @UseGuards(AuthGuard)
    async createComment(
        @User() currentUser: UserEntity,
        @Param('slug') slug: string,
        @Body('comment') createCommentDto: CreateCommentDto
    ): Promise<ICommentResponse> {
        return await this.commentService.createComment(currentUser, slug, createCommentDto);
    }

    @Get()
    async getComments(
        @Param('slug') slug: string,
        @User('id') currentUserId?: number
    ): Promise<ICommentsResponse> {
        return await this.commentService.getComments(slug, currentUserId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteComment(
        @Param('slug') slug: string,
        @Param('id') commentId: number,
        @User('id') currentUserId: number
    ): Promise<void> {
        return await this.commentService.deleteComment(slug, commentId, currentUserId);
    }
}