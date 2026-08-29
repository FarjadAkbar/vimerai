import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BlitzComposeService } from '@/application/studio-core/blitz-compose.service';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';

type ComposeBody = {
  brandId: string;
  formatId: string;
  hook: string;
  sourceTemplateId?: string;
};

@Controller('blitz')
@UseGuards(JwtAuthGuard)
export class BlitzComposeController {
  constructor(private readonly blitzComposeService: BlitzComposeService) {}

  @Post('compose')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async composeBlitzEdit(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: ComposeBody,
  ) {
    if (!file) {
      throw new BadRequestException('Composed file is required');
    }
    if (!body.brandId || !body.formatId || !body.hook?.trim()) {
      throw new BadRequestException('brandId, formatId, and hook are required');
    }

    const compose = await this.blitzComposeService.composeAndSave(user.userId, {
      brandId: body.brandId,
      formatId: body.formatId,
      hook: body.hook.trim(),
      sourceTemplateId: body.sourceTemplateId ?? null,
      file: file.buffer,
      contentType: file.mimetype,
      originalName: file.originalname,
    });

    return { compose };
  }

  @Get('compose/:jobId')
  async getComposeJob(
    @CurrentUser() user: { userId: string },
    @Param('jobId') jobId: string,
  ) {
    const compose = await this.blitzComposeService.getComposeJob(
      user.userId,
      jobId,
    );
    return { compose };
  }
}
