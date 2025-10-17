import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { Repository } from "typeorm";
import { CreateArticleDto } from "./createArticle.dto";
import { UserEntity } from "../user/user.entity";
import { IArticleResponse } from "./types/articleResponse.interface";
import { IArticlesResponse } from "./types/articlesResponse.interface";
import { IArticleQueryParams } from "./types/article-query.interface";
import slugify from "slugify";
import { FollowEntity } from "../profile/follow.entity";

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) 
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository: Repository<FollowEntity>
    ) {}

    async createArticle(user: UserEntity, createArticleDto: CreateArticleDto): Promise<IArticleResponse> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) article.tagList = [];

        article.slug = this.generateSlug(article.title);
        article.author = user;

        const savedArticle = await this.articleRepository.save(article);
        return this.buildArticleResponse(savedArticle);
    }

    async getSingleArticle(slug: string, currentUserId?: number): Promise<IArticleResponse> {
        const article = await this.findBySlug(slug);
        return this.buildArticleResponse(article, currentUserId);
    }

    async findAll(query: IArticleQueryParams, currentUserId?: number): Promise<IArticlesResponse> {
        const queryBuilder = this.articleRepository
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author');

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`
            });
        }

        if (query.author) {
            const author = await this.userRepository.findOne({
                where: { username: query.author }
            });
            if (author) {
                queryBuilder.andWhere('author.id = :authorId', {
                    authorId: author.id
                });
            } else {
                return { articles: [], articlesCount: 0 };
            }
        }

        if (query.favorited) {
            const favoriter = await this.userRepository.findOne({
                where: { username: query.favorited },
                relations: ['favorites']
            });
            if (favoriter) {
                const favoriteArticleIds = favoriter.favorites.map(article => article.id);
                if (favoriteArticleIds.length > 0) {
                    queryBuilder.andWhere('articles.id IN (:...favoriteIds)', {
                        favoriteIds: favoriteArticleIds
                    });
                } else {
                    return { articles: [], articlesCount: 0 };
                }
            } else {
                return { articles: [], articlesCount: 0 };
            }
        }

        if (query.limit) {
            queryBuilder.take(query.limit);
        }

        if (query.offset) {
            queryBuilder.skip(query.offset);
        }

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const [articles, articlesCount] = await queryBuilder.getManyAndCount();
        
        const articlesWithFavorites = await Promise.all(
            articles.map(article => this.buildArticleResponse(article, currentUserId))
        );

        return {
            articles: articlesWithFavorites.map(response => response.article),
            articlesCount
        };
    }

    async getFeed(currentUserId: number, query: IArticleQueryParams): Promise<IArticlesResponse> {
        const follows = await this.followRepository.find({
            where: { followerId: currentUserId }
        });

        if (follows.length === 0) {
            return { articles: [], articlesCount: 0 };
        }

        const followedUserIds = follows.map(follow => follow.followingId);

        const queryBuilder = this.articleRepository
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')
            .where('author.id IN (:...followedUserIds)', { followedUserIds });

        if (query.limit) {
            queryBuilder.take(query.limit);
        }

        if (query.offset) {
            queryBuilder.skip(query.offset);
        }

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const [articles, articlesCount] = await queryBuilder.getManyAndCount();
        
        const articlesWithFavorites = await Promise.all(
            articles.map(article => this.buildArticleResponse(article, currentUserId))
        );

        return {
            articles: articlesWithFavorites.map(response => response.article),
            articlesCount
        };
    }

    async updateArticle(slug: string, currentUserId: number, updateArticleDto: CreateArticleDto): Promise<IArticleResponse> {
        const article = await this.findBySlug(slug);
        if (article.author.id !== currentUserId) {
            throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
        }
        Object.assign(article, updateArticleDto);
        return this.buildArticleResponse(await this.articleRepository.save(article));
    }

    async findBySlug(slug: string): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({
            where: { slug },
            relations: ['author', 'favoritedBy']
        });
        if (!article) {
            throw new HttpException("Article not found", HttpStatus.NOT_FOUND);
        }
        return article;
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<IArticleResponse> {
        const article = await this.findBySlug(slug);
        if (article.author.id !== currentUserId) {
            throw new HttpException("You are not an author", HttpStatus.FORBIDDEN);
        }
        await this.articleRepository.remove(article);
        return this.buildArticleResponse(article);
    }

    async addToFavoritesArticle(slug: string, currentUserId: number): Promise<IArticleResponse> {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ['favorites']
        });
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        
        const article = await this.findBySlug(slug);
        
        const isNotFavorite = user.favorites.findIndex(favorite => favorite.id === article.id) === -1;
        if (isNotFavorite) {
            user.favorites.push(article);
            article.favoritesCount = (article.favoritesCount || 0) + 1;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }
        
        return this.buildArticleResponse(article, currentUserId);
    }

    async removeFromFavoritesArticle(slug: string, currentUserId: number): Promise<IArticleResponse> {
        const user = await this.userRepository.findOne({
            where: { id: currentUserId },
            relations: ['favorites']
        });
        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }
        
        const article = await this.findBySlug(slug);
        
        const favoriteIndex = user.favorites.findIndex(favorite => favorite.id === article.id);
        if (favoriteIndex >= 0) {
            user.favorites.splice(favoriteIndex, 1);
            article.favoritesCount = Math.max((article.favoritesCount || 1) - 1, 0);
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }
        
        return this.buildArticleResponse(article, currentUserId);
    }

    private async buildArticleResponse(article: ArticleEntity, currentUserId?: number): Promise<IArticleResponse> {
        let isFavorited = false;
        let isFollowing = false; // TODO: Implement following functionality
        
        if (currentUserId) {
            const currentUser = await this.userRepository.findOne({
                where: { id: currentUserId },
                relations: ['favorites']
            });
            if (currentUser) {
                isFavorited = currentUser.favorites.some(favoriteArticle => favoriteArticle.id === article.id);
            }
        }

        const { favoritedBy, ...articleData } = article;
        const { password, email, favorites, articles, ...authorData } = article.author;

        const articleResponse = {
            ...articleData,
            favoritesCount: Math.max(article.favoritesCount || 0, 0),
            favorited: isFavorited,
            author: {
                ...authorData,
                following: isFollowing,
                bio: authorData.bio || null,
                image: authorData.image || null
            }
        };

        return { article: articleResponse };
    }

    private generateSlug(title: string): string {
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2,9);
        return `${slugify(title , {lower: true})}-${id}`;
    }
}