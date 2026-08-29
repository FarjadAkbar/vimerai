import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { toMediaAssetResponse } from '@/application/studio-core/media-asset-response';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { maxUploadBytesForKind } from '@/application/studio-core/media-asset-upload';

@Controller('media-assets')
@UseGuards(JwtAuthGuard)
export class MediaAssetsController {
  constructor(private readonly mediaAssetService: MediaAssetService) {}

  @Get()
  async listMediaAssets(
    @CurrentUser() user: { userId: string },
    @Query('kind') kind?: string,
  ) {
    const parsedKind = parseKindQuery(kind);
    const assets = await this.mediaAssetService.listMediaAssets(
      user.userId,
      parsedKind ? { kind: parsedKind } : undefined,
    );
    return { assets: assets.map(toMediaAssetResponse) };
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: Math.max(
          maxUploadBytesForKind(MediaAssetKind.IMAGE),
          maxUploadBytesForKind(MediaAssetKind.VIDEO),
          maxUploadBytesForKind(MediaAssetKind.AUDIO),
        ),
      },
    }),
  )
  async uploadMediaAsset(
    @CurrentUser() user: { userId: string },
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Media file is required');
    }

    const asset = await this.mediaAssetService.uploadMediaAsset(user.userId, {
      buffer: file.buffer,
      contentType: file.mimetype,
      originalName: file.originalname,
      sizeBytes: file.size,
    });

    return { asset: toMediaAssetResponse(asset) };
  }
}

function parseKindQuery(kind?: string): MediaAssetKind | undefined {
  if (!kind) {
    return undefined;
  }
  if (
    kind === MediaAssetKind.IMAGE ||
    kind === MediaAssetKind.VIDEO ||
    kind === MediaAssetKind.AUDIO
  ) {
    return kind;
  }
  throw new BadRequestException('kind must be image, video, or audio');
}
