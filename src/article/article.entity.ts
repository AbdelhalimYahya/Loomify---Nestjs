import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { CommentEntity } from "../comment/comment.entity";

@Entity('articles')
export class ArticleEntity {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column()
    slug: string

    @Column({default: ''})
    description: string

    @Column({default: ''})
    body: string

    @Column({default: ''})
    title: string

    @Column('simple-array')
    tagList: string[]

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    createdAt: Date

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)"})
    updatedAt: Date

    @Column({default: 0})
    favoritesCount: number

    @ManyToOne(() => UserEntity, user => user.articles, { eager: true })
    author: UserEntity;

    @ManyToMany(() => UserEntity, user => user.favorites)
    @JoinTable()
    favoritedBy: UserEntity[];

    @OneToMany(() => CommentEntity, comment => comment.article)
    comments: CommentEntity[];

    favorited?: boolean;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }
}