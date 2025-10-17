import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ICommentResponse, ICommentsResponse } from './types/comment-response.interface';
import { ArticleEntity } from '../article/article.entity';
import { FollowEntity } from '../profile/follow.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository: Repository<FollowEntity>
    ) {}

    async createComment(
        currentUser: UserEntity,
        slug: string,
        createCommentDto: CreateCommentDto
    ): Promise<ICommentResponse> {
        const article = await this.articleRepository.findOne({
            where: { slug }
        });

        if (!article) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }

        const comment = new CommentEntity();
        Object.assign(comment, createCommentDto);
        comment.author = currentUser;
        comment.article = article;

        const savedComment = await this.commentRepository.save(comment);
        return this.buildCommentResponse(savedComment);
    }

    async getComments(slug: string, currentUserId?: number): Promise<ICommentsResponse> {
        const article = await this.articleRepository.findOne({
            where: { slug }
        });

        if (!article) {
            throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
        }

        const comments = await this.commentRepository.find({
            where: { article: { id: article.id } },
            relations: ['author'],
            order: { createdAt: 'DESC' }
        });

        const commentsWithAuthor = await Promise.all(
            comments.map(comment => this.buildCommentResponse(comment, currentUserId))
        );

        return { comments: commentsWithAuthor.map(response => response.comment) };
    }

    async deleteComment(slug: string, commentId: number, currentUserId: number): Promise<void> {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['author', 'article']
        });

        if (!comment) {
            throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
        }

        if (comment.author.id !== currentUserId) {
            throw new HttpException('You can only delete your own comments', HttpStatus.FORBIDDEN);
        }

        if (comment.article.slug !== slug) {
            throw new HttpException('Comment not found in this article', HttpStatus.NOT_FOUND);
        }

        await this.commentRepository.remove(comment);
    }

    private async buildCommentResponse(comment: CommentEntity, currentUserId?: number): Promise<ICommentResponse> {
        let isFollowing = false;

        if (currentUserId) {
            const follow = await this.followRepository.findOne({
                where: {
                    followerId: currentUserId,
                    followingId: comment.author.id
                }
            });
            
            isFollowing = !!follow;
        }

        const { password, email, favorites, articles, comments, ...authorData } = comment.author;

        return {
            comment: {
                id: comment.id,
                body: comment.body,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                author: {
                    ...authorData,
                    following: isFollowing,
                    bio: authorData.bio || null,
                    image: authorData.image || null
                }
            }
        };
    }
}