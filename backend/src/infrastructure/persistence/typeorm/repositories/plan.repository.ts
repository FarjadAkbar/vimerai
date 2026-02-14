import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPlanRepository } from '@/core/ports/plan.repository';
import { Plan } from '@/domain/plan.entity';
import { PlanEntity } from '../entities/plan.entity';

@Injectable()
export class TypeOrmPlanRepository implements IPlanRepository {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly repository: Repository<PlanEntity>,
  ) {}

  async getAllActivePlans(region = 'europe'): Promise<Plan[]> {
    const entities = await this.repository.find({
      where: { isActive: true, region },
      order: { sortOrder: 'ASC' },
    });
    return entities.map(PlanEntity.toDomain);
  }

  async getPlanBySlug(slug: string, region = 'europe'): Promise<Plan | null> {
    const entity = await this.repository.findOne({
      where: { slug, region, isActive: true },
    });
    return entity ? PlanEntity.toDomain(entity) : null;
  }

  async upsertPlan(plan: Plan): Promise<void> {
    const entity = PlanEntity.fromDomain(plan);
    await this.repository.save(entity);
  }

  async countPlans(): Promise<number> {
    return this.repository.count();
  }
}
