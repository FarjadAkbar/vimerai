export enum SubscriptionPlan {
  STARTER = 'starter',
  CREATOR = 'creator',
  PRO = 'pro',
}

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly plan: SubscriptionPlan,
    public readonly videosUsed: number,
    public readonly videosLimit: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    plan: SubscriptionPlan,
    videosLimit: number,
  ): Subscription {
    const now = new Date();
    return new Subscription(
      id,
      userId,
      plan,
      0,
      videosLimit,
      true,
      now,
      now,
    );
  }

  incrementUsage(): Subscription {
    return new Subscription(
      this.id,
      this.userId,
      this.plan,
      this.videosUsed + 1,
      this.videosLimit,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  updatePlan(plan: SubscriptionPlan, videosLimit: number): Subscription {
    return new Subscription(
      this.id,
      this.userId,
      plan,
      this.videosUsed,
      videosLimit,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  canGenerate(): boolean {
    return this.isActive && this.videosUsed < this.videosLimit;
  }

  getRemaining(): number {
    return Math.max(0, this.videosLimit - this.videosUsed);
  }
}

