export interface IEmailService {
  sendPasswordResetEmail(
    email: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void>;
}
