export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public passwordResetToken?: string | null,
    public passwordResetExpires?: Date | null,
  ) {}

  static create(
    id: string,
    email: string,
    passwordHash: string,
    passwordResetToken?: string | null,
    passwordResetExpires?: Date | null,
  ): User {
    const now = new Date();
    return new User(
      id,
      email,
      passwordHash,
      now,
      now,
      passwordResetToken,
      passwordResetExpires,
    );
  }

  updatePasswordResetToken(token: string | null, expiresAt: Date | null): User {
    return new User(
      this.id,
      this.email,
      this.passwordHash,
      this.createdAt,
      new Date(),
      token,
      expiresAt,
    );
  }

  updatePasswordHash(newPasswordHash: string): User {
    return new User(
      this.id,
      this.email,
      newPasswordHash,
      this.createdAt,
      new Date(),
      this.passwordResetToken,
      this.passwordResetExpires,
    );
  }
}
