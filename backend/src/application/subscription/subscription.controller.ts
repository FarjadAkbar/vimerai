import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { SubscriptionPlan } from '@/domain/subscription.entity';

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

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async createCheckout(
    @CurrentUser() user: { userId: string },
    @Body(ValidationPipe) dto: CreateCheckoutDto,
  ) {
    return this.subscriptionService.createCheckoutSession(
      user.userId,
      dto.plan,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Post('portal')
  @HttpCode(HttpStatus.OK)
  async createPortal(
    @CurrentUser() user: { userId: string },
    @Body('returnUrl') returnUrl: string,
  ) {
    return this.subscriptionService.createPortalSession(user.userId, returnUrl);
  }

  @Post('activate-mock')
  @HttpCode(HttpStatus.OK)
  async activateMockSubscription(
    @CurrentUser() user: { userId: string },
    @Body('plan') plan: SubscriptionPlan,
  ) {
    return this.subscriptionService.activateMockSubscription(user.userId, plan);
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
