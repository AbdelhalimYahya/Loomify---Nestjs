export type CommentType = {
    id: number;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: number;
        username: string;
        bio: string | null;
        image: string | null;
        following: boolean;
    };
};