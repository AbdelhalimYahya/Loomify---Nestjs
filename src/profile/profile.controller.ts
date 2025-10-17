import { Controller, Get, Param, Post, UseGuards , Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@/user/decorators/user.decorator';
import { AuthGuard } from '@/user/guards/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(@User('id') currentUserId: number, @Param('username') profileUsername: string) { 
    const profile = await this.profileService.getProfile(currentUserId, profileUsername);
    return this.profileService.generateProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(@User('id') currentUserId: number, @Param('username') followingUsername: string) {
    const newFollow = await this.profileService.followProfile(currentUserId, followingUsername);
    return this.profileService.generateProfileResponse(newFollow);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(@User('id') currentUserId: number, @Param('username') followingUsername: string) {
    const unfollowedProfile = await this.profileService.unfollowProfile(currentUserId, followingUsername);
    return this.profileService.generateProfileResponse(unfollowedProfile);
  }
}