import { UserEntity } from "../user.entity";

// Sorry this is a mistake from me I for interface i should have made this (typeUser)
export type IUser = Omit<UserEntity, 'hashPassword'>