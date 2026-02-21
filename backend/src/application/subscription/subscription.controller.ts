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
      dto.billingPeriod,
      dto.paypalPlanId,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Post('activate-subscription')
  @HttpCode(HttpStatus.OK)
  async activateSubscription(@Body('subscriptionId') subscriptionId: string) {
    return this.subscriptionService.activatePayPalSubscription(subscriptionId);
  }

  @Post('cancel-subscription')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@CurrentUser() user: { userId: string }) {
    return this.subscriptionService.cancelSubscription(user.userId);
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

  @Post('purchase-single-shot')
  @HttpCode(HttpStatus.OK)
  async purchaseSingleShot(@CurrentUser() user: { userId: string }) {
    return this.subscriptionService.purchaseSingleShot(user.userId);
  }

  @Post('checkout-single-shot')
  @HttpCode(HttpStatus.OK)
  async createSingleShotCheckout(
    @CurrentUser() user: { userId: string },
    @Body('successUrl') successUrl: string,
    @Body('cancelUrl') cancelUrl: string,
  ) {
    return this.subscriptionService.createSingleShotCheckout(
      user.userId,
      successUrl,
      cancelUrl,
    );
  }

  @Post('capture-single-shot')
  @HttpCode(HttpStatus.OK)
  async captureSingleShot(@Body('orderId') orderId: string) {
    return this.subscriptionService.captureSingleShot(orderId);
  }
}
