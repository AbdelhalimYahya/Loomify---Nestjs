import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ArticleEntity } from "../article/article.entity";

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    body: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @ManyToOne(() => UserEntity, user => user.comments, { eager: true })
    author: UserEntity;

    @ManyToOne(() => ArticleEntity, article => article.comments, { onDelete: 'CASCADE' })
    article: ArticleEntity;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }
}