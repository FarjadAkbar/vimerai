import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ViralRemixService } from '@/application/studio-core/viral-remix.service';
import { CreateViralRemixDto } from '@/application/studio-core/dto/create-viral-remix.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

@Controller('viral-remix')
@UseGuards(JwtAuthGuard)
export class ViralRemixController {
  constructor(private readonly viralRemixService: ViralRemixService) {}

  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  async createRemix(
    @CurrentUser() user: { userId: string },
    @Body() body: CreateViralRemixDto,
  ) {
    const remix = await this.viralRemixService.createRemix(user.userId, body);
    return { remix };
  }

  @Get('jobs/:id')
  async getRemix(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const remix = await this.viralRemixService.getRemix(user.userId, id);
    return { remix };
  }

  @Post('jobs/:id/regenerate')
  @HttpCode(HttpStatus.CREATED)
  async regenerateRemix(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    const remix = await this.viralRemixService.regenerateRemix(user.userId, id);
    return { remix };
  }
}
