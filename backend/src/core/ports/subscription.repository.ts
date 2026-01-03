import { Subscription } from '@/domain/subscription.entity';

export interface ISubscriptionRepository {
  createSubscription(subscription: Subscription): Promise<void>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | null>;
  updateSubscription(subscription: Subscription): Promise<void>;
}
