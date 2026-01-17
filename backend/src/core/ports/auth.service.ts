export interface SignupDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetDto {
  token: string;
  newPassword: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface IAuthService {
  signup(dto: SignupDto): Promise<AuthResult>;
  login(dto: LoginDto): Promise<AuthResult>;
  requestPasswordReset(dto: PasswordResetRequestDto): Promise<void>;
  resetPassword(dto: PasswordResetDto): Promise<void>;
}
