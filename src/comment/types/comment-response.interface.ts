import { CommentType } from './comment.type';

export interface ICommentResponse {
    comment: CommentType;
}

export interface ICommentsResponse {
    comments: CommentType[];
}