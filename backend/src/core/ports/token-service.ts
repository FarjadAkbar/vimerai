export interface ITokenService {
  generateToken(payload: { userId: string; email: string }): string;
  verifyToken(token: string): { userId: string; email: string } | null;
  generateResetToken(): string;
}
