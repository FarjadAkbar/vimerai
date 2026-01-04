import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IAuthService,
  SignupDto,
  LoginDto,
  PasswordResetRequestDto,
  PasswordResetDto,
  AuthResult,
} from '@/core/ports/auth.service';
import type { IUserRepository } from '@/core/ports/user.repository';
import type { IPasswordHasher } from '@/core/ports/password-hasher';
import type { ITokenService } from '@/core/ports/token-service';
import { User } from '@/domain/user.entity';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  PASSWORD_HASHER_TOKEN,
  TOKEN_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER_TOKEN)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: ITokenService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.getUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Create user
    const user = User.create(uuidv4(), dto.email, passwordHash);
    await this.userRepository.createUser(user);

    // Generate token
    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    // Find user
    const user = await this.userRepository.getUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isValid = await this.passwordHasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  async requestPasswordReset(dto: PasswordResetRequestDto): Promise<void> {
    const user = await this.userRepository.getUserByEmail(dto.email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    // Generate reset token
    const resetToken = this.tokenService.generateResetToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    // Update user with reset token
    const updatedUser = user.updatePasswordResetToken(resetToken, resetExpires);
    await this.userRepository.updateUser(updatedUser);

    // In a real application, you would send an email here with the reset token
    // For Phase 1, we'll just log it (but per requirements, we shouldn't log user content)
    // The token should be returned or sent via email in production
  }

  async resetPassword(dto: PasswordResetDto): Promise<void> {
    // Find user by reset token
    const user = await this.userRepository.getUserByResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const newPasswordHash = await this.passwordHasher.hash(dto.newPassword);

    // Update user with new password and clear reset token
    const updatedUser = user
      .updatePasswordHash(newPasswordHash)
      .updatePasswordResetToken(null, null);

    await this.userRepository.updateUser(updatedUser);
  }
}
