import { BadRequestException } from '@nestjs/common';
import { MediaAssetKind } from '@/domain/media-asset.entity';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);
const AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
]);

export function inferMediaAssetKind(contentType: string): MediaAssetKind {
  if (IMAGE_TYPES.has(contentType)) {
    return MediaAssetKind.IMAGE;
  }
  if (VIDEO_TYPES.has(contentType)) {
    return MediaAssetKind.VIDEO;
  }
  if (AUDIO_TYPES.has(contentType)) {
    return MediaAssetKind.AUDIO;
  }
  throw new BadRequestException(
    'Unsupported file type. Upload an image (PNG/JPEG/WebP), video (MP4/WebM/MOV), or audio (MP3/WAV/OGG).',
  );
}

export function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/png':
      return 'png';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
      return 'mov';
    case 'video/mp4':
      return 'mp4';
    case 'audio/webm':
      return 'webm';
    case 'audio/ogg':
      return 'ogg';
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    case 'audio/mp4':
      return 'm4a';
    case 'audio/mpeg':
    case 'audio/mp3':
    default:
      return 'mp3';
  }
}

export function maxUploadBytesForKind(kind: MediaAssetKind): number {
  switch (kind) {
    case MediaAssetKind.IMAGE:
      return 8 * 1024 * 1024;
    case MediaAssetKind.VIDEO:
      return 50 * 1024 * 1024;
    case MediaAssetKind.AUDIO:
      return 20 * 1024 * 1024;
  }
}
