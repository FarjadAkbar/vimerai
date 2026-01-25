import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { IUserRepository } from '@/core/ports/user.repository';
import { USER_REPOSITORY_TOKEN } from '@/core/tokens/injection.tokens';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async updateUserProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // For Phase 1, only email updates are supported
    // In a real app, you'd update the user entity
    return {
      user: {
        id: user.id,
        email: dto.email || user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
