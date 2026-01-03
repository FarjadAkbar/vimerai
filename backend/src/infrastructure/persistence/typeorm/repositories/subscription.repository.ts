import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISubscriptionRepository } from '@/core/ports/subscription.repository';
import { Subscription } from '@/domain/subscription.entity';
import { SubscriptionEntity } from '../entities/subscription.entity';

@Injectable()
export class TypeOrmSubscriptionRepository
  implements ISubscriptionRepository
{
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repository: Repository<SubscriptionEntity>,
  ) {}

  async createSubscription(subscription: Subscription): Promise<void> {
    const entity = SubscriptionEntity.fromDomain(subscription);
    await this.repository.save(entity);
  }

  async getSubscriptionByUserId(
    userId: string,
  ): Promise<Subscription | null> {
    const entity = await this.repository.findOne({ where: { userId } });
    return entity ? SubscriptionEntity.toDomain(entity) : null;
  }

  async updateSubscription(subscription: Subscription): Promise<void> {
    const entity = SubscriptionEntity.fromDomain(subscription);
    await this.repository.save(entity);
  }
}

