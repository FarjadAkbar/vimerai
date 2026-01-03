import { SubscriptionPlan } from '@/domain/subscription.entity';

export interface ISubscriptionService {
  getCurrentSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    videosRemaining: number;
    limit: number;
  }>;
  getUsage(userId: string): Promise<{
    videosUsed: number;
    videosRemaining: number;
    limit: number;
  }>;
  canGenerate(userId: string): Promise<boolean>;
  recordVideoGeneration(userId: string): Promise<void>;
}

