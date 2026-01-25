import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.getUserProfile(user.userId);
  }

  @Put('me')
  async updateMe(
    @CurrentUser() user: { userId: string },
    @Body(ValidationPipe) dto: UpdateUserDto,
  ) {
    return this.usersService.updateUserProfile(user.userId, dto);
  }
}
