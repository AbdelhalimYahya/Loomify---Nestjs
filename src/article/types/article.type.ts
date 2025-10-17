export type ArticleType = {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: Date;
    updatedAt: Date;
    favoritesCount: number;
    favorited: boolean;
    author: {
        id: number;
        username: string;
        bio: string | null;
        image: string | null;
        following: boolean;
    };
};