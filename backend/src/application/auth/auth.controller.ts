import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body(ValidationPipe) dto: SignupDto,
  ): Promise<{ user: { id: string; email: string }; token: string }> {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) dto: LoginDto,
  ): Promise<{ user: { id: string; email: string }; token: string }> {
    return this.authService.login(dto);
  }

  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body(ValidationPipe) dto: PasswordResetRequestDto,
  ): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(dto);
    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(ValidationPipe) dto: PasswordResetDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto);
    return { message: 'Password has been reset successfully' };
  }
}

