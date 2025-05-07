import { Controller, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @ApiOperation({ summary: 'Get user profile with company info' })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getProfile(@Request() req) {
    const userId = req.user.userId;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userProfile } = user;
    return userProfile;
  }
}
