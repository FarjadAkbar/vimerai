import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '@/core/ports/token-service';
import * as crypto from 'crypto';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: { userId: string; email: string }): string {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = this.jwtService.verify<{
        userId: string;
        email: string;
      }>(token);
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      return null;
    }
  }

  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

