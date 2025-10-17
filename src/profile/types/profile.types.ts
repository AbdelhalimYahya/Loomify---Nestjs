import { IUser } from "@/user/types/user.type";

export type profileType = IUser & {
    following: boolean;
}