import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { profileType } from './types/profile.types';
import { IProfileResponse } from './types/profileResponse.interface';
import { FollowEntity } from './follow.entity';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>) {}

    async getProfile(currentUserId: number , profileUsername: string) : Promise<profileType> {
        const profile = await this.userRepository.findOne({ where: { username: profileUsername } });
        
        if (!profile) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
        }

        let isFollowed = false;
        if (currentUserId) {
            const follow = await this.followRepository.findOne({
                where: {
                    followerId: currentUserId,
                    followingId: profile.id
                }
            })

            isFollowed = Boolean(follow)
        }
        
        return {...profile , following: isFollowed};
    }

    async followProfile(currentUserId: number , followingUsername: string) : Promise<profileType> {
        const followingProfile = await this.userRepository.findOne({ where: { username: followingUsername } });
        if (!followingProfile) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
        }

        const follow = await this.followRepository.findOne({ where: { followerId: currentUserId, followingId: followingProfile.id } });
        if (!follow) {
            const newFollow = new FollowEntity();
            newFollow.followerId = currentUserId;
            newFollow.followingId = followingProfile.id;
            await this.followRepository.save(newFollow);
        }

        if (currentUserId === followingProfile.id) {
            throw new HttpException('You cannot follow yourself', HttpStatus.BAD_REQUEST);
        }

        return {...followingProfile , following: true};
    }

    async unfollowProfile (currentUserId: number , followingUsername: string) : Promise<profileType> {
        const followingProfile = await this.userRepository.findOne({ where: { username: followingUsername } });
        if (!followingProfile) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);
        }

        const follow = await this.followRepository.findOne({ where: { followerId: currentUserId, followingId: followingProfile.id } });
        if (follow) {
            await this.followRepository.remove(follow);
        }

        if (currentUserId === followingProfile.id) {
            throw new HttpException('You cannot unfollow yourself', HttpStatus.BAD_REQUEST);
        }

        return {...followingProfile , following: false};
        }

    generateProfileResponse(profile: profileType) : IProfileResponse {
        delete profile.password;
        delete profile.email;
        return { profile };
    }
}
