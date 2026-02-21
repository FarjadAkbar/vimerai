import { Plan } from '@/domain/plan.entity';

export interface IPlanRepository {
  getPlanBySlug(slug: string): Promise<Plan | null>;
  upsertPlan(plan: Plan): Promise<void>;
  countPlans(): Promise<number>;
}
