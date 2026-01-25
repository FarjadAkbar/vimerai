export interface ITokenService {
  generateToken(
    payload: { userId: string; email: string },
    rememberMe?: boolean,
  ): string;
  verifyToken(token: string): { userId: string; email: string } | null;
  generateResetToken(): string;
}
