import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentEntity } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { ArticleEntity } from '../article/article.entity';
import { FollowEntity } from '../profile/follow.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CommentEntity, UserEntity, ArticleEntity, FollowEntity])
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService]
})
export class CommentModule {}