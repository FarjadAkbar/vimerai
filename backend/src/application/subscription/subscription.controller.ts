import { Controller, Get, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('current')
  async getCurrent(@CurrentUser() user: { userId: string }) {
    return this.subscriptionService.getCurrentSubscription(user.userId);
  }

  @Get('usage')
  async getUsage(@CurrentUser() user: { userId: string }) {
    return this.subscriptionService.getUsage(user.userId);
  }
}

@Controller('subscription')
export class SubscriptionPublicController {
  @Get('plans')
  async getPlans() {
    return {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: 9.99,
          videosPerMonth: 10,
        },
        {
          id: 'creator',
          name: 'AI Creator',
          price: 29.99,
          videosPerMonth: 50,
          popular: true,
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 99.99,
          videosPerMonth: 200,
        },
      ],
    };
  }
}

