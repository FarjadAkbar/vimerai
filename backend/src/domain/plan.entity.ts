export type PlanType = 'subscription' | 'one-time';

/** Plan has only name and limit; pricing / PayPal IDs live on frontend or PayPal. */
export class Plan {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly type: PlanType,
    public readonly videosPerMonth: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
