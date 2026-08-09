import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePostJobDto } from '@/application/post-jobs/dto/create-post-job.dto';
import { PostJobService } from '@/application/post-jobs/post-job.service';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@Controller('post-jobs')
@UseGuards(JwtAuthGuard)
export class PostJobsController {
  constructor(private readonly postJobService: PostJobService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { userId: string },
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: CreatePostJobDto,
  ) {
    return this.postJobService.createPostJob(user.userId, {
      brandId: dto.brandId,
      productId: dto.productId,
      formatId: dto.formatId,
    });
  }

  @Get()
  async list(@CurrentUser() user: { userId: string }) {
    return this.postJobService.listPostJobs(user.userId);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postJobService.getPostJob(user.userId, id);
  }

  @Post(':id/regenerate')
  @HttpCode(HttpStatus.CREATED)
  async regenerate(
    @CurrentUser() user: { userId: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postJobService.regeneratePostJob(user.userId, id);
  }
}
