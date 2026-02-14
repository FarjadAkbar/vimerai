import { Plan } from '@/domain/plan.entity';

export interface IPlanRepository {
  getAllActivePlans(region?: string): Promise<Plan[]>;
  getPlanBySlug(slug: string, region?: string): Promise<Plan | null>;
  upsertPlan(plan: Plan): Promise<void>;
  countPlans(): Promise<number>;
}
