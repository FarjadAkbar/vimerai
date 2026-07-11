import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { IProductKitService } from '@/core/ports/product-kit.service';
import {
  KitGenerationContext,
  ProductKit,
  ProductKitAssetRef,
} from '@/domain/product-kit.entity';
import type { IStorageService } from '@/core/ports/storage.service';
import { Inject } from '@nestjs/common';
import { STORAGE_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';

interface KitManifestJson {
  id: string;
  name: string;
  tagline: string;
  category: string;
  colors: { primary: string; secondary: string; background: string };
  assets: Record<string, string>;
  prompt: { brandContext: string; negativePrompt: string };
  generation: {
    preferImageConditioning: boolean;
    textToVideoModel: string;
    imageToVideoModel: string;
  };
  shotTemplates?: Record<string, string>;
}

@Injectable()
export class FileProductKitService
  implements IProductKitService, OnModuleInit
{
  private readonly logger = new Logger(FileProductKitService.name);
  private readonly kitRootDir: string;
  private readonly activeKitId: string;
  private activeKit: ProductKit | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {
    const kitConfig = this.configService.get<{
      rootDir: string;
      activeKitId: string;
    }>('kit');
    this.kitRootDir = kitConfig?.rootDir ?? path.join(process.cwd(), '..', 'kit');
    this.activeKitId = kitConfig?.activeKitId ?? 'nitro-shine';
  }

  async onModuleInit(): Promise<void> {
    this.activeKit = await this.loadKit(this.activeKitId);
    await this.syncKitAssetsToStorage(this.activeKit);
    this.logger.log(`Active product kit loaded: ${this.activeKit.name}`);
  }

  async getActiveKit(): Promise<ProductKit> {
    if (!this.activeKit) {
      this.activeKit = await this.loadKit(this.activeKitId);
    }
    return this.activeKit;
  }

  async getKitById(kitId: string): Promise<ProductKit | null> {
    if (kitId === this.activeKitId && this.activeKit) {
      return this.activeKit;
    }
    try {
      return await this.loadKit(kitId);
    } catch {
      return null;
    }
  }

  async buildGenerationContext(
    userPrompt: string,
    shotTemplateKey?: string,
  ): Promise<KitGenerationContext> {
    const kit = await this.getActiveKit();
    const trimmed = userPrompt.trim();

    const templatePrompt =
      shotTemplateKey && kit.shotTemplates[shotTemplateKey]
        ? kit.shotTemplates[shotTemplateKey]
        : trimmed;

    const scenePrompt = shotTemplateKey ? templatePrompt : trimmed;

    const prompt = [
      kit.prompt.brandContext,
      scenePrompt,
      `Brand colors: primary ${kit.colors.primary}, on ${kit.colors.background} background.`,
    ]
      .filter(Boolean)
      .join(' ');

    const conditioningAssets = kit.assets.filter(
      (asset) => asset.key !== 'logo',
    );
    const productAssetUrls = await this.resolveProviderAssetUrls(
      kit,
      conditioningAssets,
    );

    const useImageConditioning =
      kit.generation.preferImageConditioning && productAssetUrls.length > 0;

    return {
      kitId: kit.id,
      prompt,
      negativePrompt: kit.prompt.negativePrompt,
      productAssetUrls,
      useImageConditioning,
      textToVideoModel: kit.generation.textToVideoModel,
      imageToVideoModel: kit.generation.imageToVideoModel,
    };
  }

  private async resolveProviderAssetUrls(
    kit: ProductKit,
    assets: ProductKitAssetRef[] = kit.assets,
  ): Promise<string[]> {
    const kitDir = path.join(this.kitRootDir, kit.id);
    const urls: string[] = [];

    for (const asset of assets) {
      const absolutePath = path.join(kitDir, asset.relativePath);
      try {
        urls.push(await this.toDataUri(absolutePath, asset.mimeType));
      } catch {
        if (asset.resolvedUrl) {
          urls.push(asset.resolvedUrl);
        }
      }
    }

    return urls;
  }

  private async loadKit(kitId: string): Promise<ProductKit> {
    const kitDir = path.join(this.kitRootDir, kitId);
    const manifestPath = path.join(kitDir, 'manifest.json');

    let raw: string;
    try {
      raw = await fs.readFile(manifestPath, 'utf-8');
    } catch {
      throw new NotFoundException(`Product kit not found: ${kitId}`);
    }

    const manifest = JSON.parse(raw) as KitManifestJson;
    const assets: ProductKitAssetRef[] = [];

    for (const [key, relativePath] of Object.entries(manifest.assets)) {
      const absolutePath = path.join(kitDir, relativePath);
      const mimeType = this.mimeTypeForPath(absolutePath);
      assets.push({
        key,
        relativePath,
        mimeType,
      });
    }

    return new ProductKit(
      manifest.id,
      manifest.name,
      manifest.tagline,
      manifest.category,
      manifest.colors,
      manifest.prompt,
      manifest.generation,
      manifest.shotTemplates ?? {},
      assets,
    );
  }

  private async syncKitAssetsToStorage(kit: ProductKit): Promise<void> {
    const kitDir = path.join(this.kitRootDir, kit.id);

    for (const asset of kit.assets) {
      const absolutePath = path.join(kitDir, asset.relativePath);
      try {
        const buffer = await fs.readFile(absolutePath);
        const storageKey = `kits/${kit.id}/${path.basename(asset.relativePath)}`;
        const publicUrl = await this.storageService.upload(
          storageKey,
          buffer,
          asset.mimeType,
        );
        asset.resolvedUrl = publicUrl;
        this.logger.log(`Kit asset synced: ${asset.key} -> ${publicUrl}`);
      } catch (error) {
        this.logger.warn(
          `Could not sync kit asset ${asset.key}: ${error instanceof Error ? error.message : 'unknown'}`,
        );
        asset.resolvedUrl = await this.toDataUri(absolutePath, asset.mimeType);
      }
    }
  }

  private async toDataUri(
    absolutePath: string,
    mimeType: string,
  ): Promise<string> {
    const buffer = await fs.readFile(absolutePath);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  }

  private mimeTypeForPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
