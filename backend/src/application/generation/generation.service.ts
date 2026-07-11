import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IGenerationRepository } from '@/core/ports/generation.repository';
import type { IGenerationService } from '@/core/ports/generation.service';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type { IProductRepository } from '@/core/ports/product.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { ITextGenerationProvider } from '@/core/ports/text-generation.provider';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  GENERATION_REPOSITORY_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
  TEXT_GENERATION_PROVIDER_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { BrandKit } from '@/domain/brand-kit.entity';
import {
  Generation,
  type GenerationSnapshot,
  type ReelStoryboardContent,
  type SocialPostContent,
  type VideoContent,
} from '@/domain/generation.entity';
import { Product } from '@/domain/product.entity';
import { GenerationMode } from '@/domain/video.entity';
import type {
  FeedPlatform,
  Goal,
  LengthTier,
  PostImageMode,
  ReelPlatform,
} from '@/types/generation/enums';
import {
  DEFAULT_TEXT_SECTION_REGEN_LIMIT,
  type CreateGenerationInput,
  type CreateGenerationResult,
  type GenerationArmState,
  type ManualEditGenerationInput,
  type RegenerateSectionInput,
  type TextSectionKey,
} from '@/types/generation/generation';
import type { PromptLayers } from '@/types/generation/text-generation';

const QUALITY_AND_SAFETY =
  'Write human, benefit-led marketing copy. Never sound AI-generated. Strong hooks and clear CTAs.';

@Injectable()
export class GenerationService implements IGenerationService {
  constructor(
    @Inject(TEXT_GENERATION_PROVIDER_TOKEN)
    private readonly textGenerationProvider: ITextGenerationProvider,
    @Inject(IMAGE_GENERATION_PROVIDER_TOKEN)
    private readonly imageGenerationProvider: IImageGenerationProvider,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
    @Inject(GENERATION_REPOSITORY_TOKEN)
    private readonly generationRepository: IGenerationRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {
    void this.imageGenerationProvider;
  }

  async createGeneration(
    userId: string,
    input: CreateGenerationInput,
  ): Promise<CreateGenerationResult> {
    const brandKits = await this.brandKitRepository.findByUserId(userId);
    if (brandKits.length === 0) {
      throw new BadRequestException(
        'Create a Brand Kit before generating content',
      );
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product || product.userId !== userId) {
      throw new BadRequestException('Product not found');
    }
    if (product.brandKitIds.length === 0) {
      throw new BadRequestException('Product must be linked to a Brand Kit');
    }

    const brandKit = await this.resolveBrandKit(
      userId,
      product,
      input.brandKitId,
      brandKits,
    );

    const lengthTier: LengthTier = input.lengthTier ?? 'teaser';
    const feedPlatform: FeedPlatform = input.feedPlatform ?? 'instagram';
    const reelPlatform: ReelPlatform =
      input.reelPlatform ?? 'instagram_reels';
    const postImageMode: PostImageMode =
      input.postImageMode ?? 'product_photo';

    if (lengthTier !== 'teaser') {
      throw new BadRequestException(
        'Only Teaser Length Tier is available in this release',
      );
    }

    const canGenerate = await this.subscriptionService.canGenerate(userId);
    if (!canGenerate) {
      throw new BadRequestException('Generation credit limit reached');
    }

    const snapshot = this.buildSnapshot(brandKit, product);
    let generation = Generation.create({
      id: uuidv4(),
      userId,
      goal: input.goal,
      lengthTier,
      feedPlatform,
      reelPlatform,
      postImageMode,
      brandKitId: brandKit.id,
      productId: product.id,
      snapshot,
    });
    await this.generationRepository.create(generation);
    await this.subscriptionService.recordVideoGeneration(userId);

    const layers = this.buildLayers(snapshot, input.goal, {
      lengthTier,
      feedPlatform,
      reelPlatform,
      postImageMode,
    });

    const arms: GenerationArmState[] = [...generation.arms];
    let creativeBrief: string | null = null;
    let socialPost: SocialPostContent | null = null;
    let reelStoryboard: ReelStoryboardContent | null = null;
    let reelCaption: string | null = null;

    try {
      const briefResult = await this.textGenerationProvider.generateText({
        artifact: 'creative-brief',
        layers: {
          ...layers,
          outputSchema:
            'Return JSON: hook, attention, productDisplay, viewerConnection, cta',
        },
      });
      creativeBrief = briefResult.text;
      this.setArm(arms, 'creative-brief', 'completed');
    } catch (error) {
      this.setArm(
        arms,
        'creative-brief',
        'failed',
        error instanceof Error ? error.message : 'Creative Brief failed',
      );
    }

    const briefContext = creativeBrief ?? '';

    const textJobs = await Promise.allSettled([
      this.textGenerationProvider.generateText({
        artifact: 'social-post',
        layers: {
          ...layers,
          outputSchema: `Creative Brief: ${briefContext}. Return JSON: headline, body, cta, caption, hashtags (string array) for ${feedPlatform}`,
        },
      }),
      this.textGenerationProvider.generateText({
        artifact: 'reel-storyboard',
        layers: {
          ...layers,
          outputSchema: `Creative Brief: ${briefContext}. Return JSON: hook, attention, productDisplay, viewerConnection, scenes[{order,description}] for a Teaser reel`,
        },
      }),
      this.textGenerationProvider.generateText({
        artifact: 'reel-caption',
        layers: {
          ...layers,
          outputSchema: `Creative Brief: ${briefContext}. Return plain caption text for ${reelPlatform}`,
        },
      }),
    ]);

    if (textJobs[0].status === 'fulfilled') {
      const parsed = this.parseJson<{
        headline: string;
        body: string;
        cta: string;
        caption: string;
        hashtags: string[];
      }>(textJobs[0].value.text);
      if (!parsed?.headline && !parsed?.caption) {
        this.setArm(
          arms,
          'social-post',
          'failed',
          'Social Post response was not valid JSON',
        );
      } else {
        socialPost = {
          headline: parsed?.headline ?? '',
          body: parsed?.body ?? '',
          cta: parsed?.cta ?? '',
          caption: parsed?.caption ?? textJobs[0].value.text,
          hashtags: parsed?.hashtags ?? [],
          postImageUrl: snapshot.product.imageUrls[0] ?? '',
          feedPlatform,
        };
        this.setArm(arms, 'social-post', 'completed');
      }
    } else {
      this.setArm(arms, 'social-post', 'failed', String(textJobs[0].reason));
    }

    if (textJobs[1].status === 'fulfilled') {
      const parsed = this.parseJson<ReelStoryboardContent>(
        textJobs[1].value.text,
      );
      if (!parsed?.hook && !parsed?.scenes?.length) {
        this.setArm(
          arms,
          'reel-storyboard',
          'failed',
          'Reel Storyboard response was not valid JSON',
        );
      } else {
        reelStoryboard = {
          hook: parsed.hook ?? '',
          attention: parsed.attention ?? '',
          productDisplay: parsed.productDisplay ?? '',
          viewerConnection: parsed.viewerConnection ?? '',
          scenes: parsed.scenes ?? [],
        };
        this.setArm(arms, 'reel-storyboard', 'completed');
      }
    } else {
      this.setArm(
        arms,
        'reel-storyboard',
        'failed',
        String(textJobs[1].reason),
      );
    }

    if (textJobs[2].status === 'fulfilled') {
      reelCaption = textJobs[2].value.text.trim();
      this.setArm(arms, 'reel-caption', 'completed');
    } else {
      this.setArm(arms, 'reel-caption', 'failed', String(textJobs[2].reason));
    }

    let videoContent: VideoContent | null = null;
    try {
      const videoPrompt = [
        `Brand: ${brandKit.name}. Tone: ${brandKit.tone}.`,
        `Product: ${product.name}. ${product.description}`,
        `Goal: ${input.goal}. Teaser ~8-10s.`,
        briefContext,
        'Beats: hook, attention, product display, viewer connection. Product visibility first.',
      ].join(' ');

      const videoResult = await this.waitForVideo(
        await this.videoGenerationProvider.generateVideo({
          prompt: videoPrompt,
          mode: GenerationMode.FAST,
          useImageConditioning: product.imageUrls.length > 0,
          productAssetUrls: product.imageUrls,
          negativePrompt: brandKit.thingsToAvoid,
        }),
      );

      videoContent = {
        jobId: videoResult.jobId,
        videoUrl: videoResult.videoUrl ?? null,
        status:
          videoResult.status === 'failed'
            ? ('failed' as const)
            : videoResult.status === 'completed'
              ? ('completed' as const)
              : ('processing' as const),
        lengthTier,
        reelPlatform,
        error: videoResult.error,
      };
      this.setArm(
        arms,
        'video',
        videoContent.status === 'failed' ? 'failed' : videoContent.status,
        videoResult.error,
      );
    } catch (error) {
      videoContent = {
        jobId: null,
        videoUrl: null,
        status: 'failed',
        lengthTier,
        reelPlatform,
        error: error instanceof Error ? error.message : 'Video failed',
      };
      this.setArm(arms, 'video', 'failed', videoContent.error);
    }

    const status = this.rollupStatus(arms);
    generation = generation.withUpdates({
      arms,
      creativeBrief,
      socialPost,
      reelStoryboard,
      reelCaption,
      video: videoContent,
      status,
    });
    await this.generationRepository.update(generation);

    return { generationId: generation.id, status };
  }

  async getGeneration(userId: string, generationId: string) {
    const generation = await this.generationRepository.findById(generationId);
    if (!generation) {
      throw new NotFoundException('Generation not found');
    }
    if (generation.userId !== userId) {
      throw new ForbiddenException('Not authorized to view this Generation');
    }
    return { generation };
  }

  async updateGeneration(
    userId: string,
    generationId: string,
    input: ManualEditGenerationInput,
  ): Promise<{ generation: Generation }> {
    const { generation } = await this.getGeneration(userId, generationId);

    if (
      !input.socialPost &&
      !input.reelStoryboard &&
      input.reelCaption === undefined
    ) {
      throw new BadRequestException('No Manual edit fields provided');
    }

    let socialPost = generation.socialPost;
    if (input.socialPost) {
      if (!socialPost) {
        throw new BadRequestException('Generation has no Social Post to edit');
      }
      socialPost = {
        ...socialPost,
        headline: input.socialPost.headline ?? socialPost.headline,
        body: input.socialPost.body ?? socialPost.body,
        cta: input.socialPost.cta ?? socialPost.cta,
        caption: input.socialPost.caption ?? socialPost.caption,
        hashtags: input.socialPost.hashtags ?? socialPost.hashtags,
      };
    }

    let reelStoryboard = generation.reelStoryboard;
    if (input.reelStoryboard) {
      if (!reelStoryboard) {
        throw new BadRequestException(
          'Generation has no Reel Storyboard to edit',
        );
      }
      const scenes =
        input.reelStoryboard.scenes !== undefined
          ? input.reelStoryboard.scenes.map((scene, index) => ({
              order: scene.order ?? index + 1,
              description: scene.description,
            }))
          : reelStoryboard.scenes;
      reelStoryboard = {
        hook: input.reelStoryboard.hook ?? reelStoryboard.hook,
        attention: input.reelStoryboard.attention ?? reelStoryboard.attention,
        productDisplay:
          input.reelStoryboard.productDisplay ?? reelStoryboard.productDisplay,
        viewerConnection:
          input.reelStoryboard.viewerConnection ??
          reelStoryboard.viewerConnection,
        scenes,
      };
    }

    const reelCaption =
      input.reelCaption !== undefined
        ? input.reelCaption
        : generation.reelCaption;

    const updated = generation.withUpdates({
      socialPost,
      reelStoryboard,
      reelCaption,
    });
    await this.generationRepository.update(updated);
    return { generation: updated };
  }

  async regenerateSection(
    userId: string,
    generationId: string,
    input: RegenerateSectionInput,
  ): Promise<{ generation: Generation }> {
    const { generation } = await this.getGeneration(userId, generationId);

    if (generation.textSectionRegenCount >= DEFAULT_TEXT_SECTION_REGEN_LIMIT) {
      throw new BadRequestException(
        `Text section regenerate fair-use limit reached (${DEFAULT_TEXT_SECTION_REGEN_LIMIT} per Generation)`,
      );
    }

    if (
      input.sectionKey === 'storyboard.scene' &&
      (input.sceneOrder === undefined || input.sceneOrder < 1)
    ) {
      throw new BadRequestException(
        'sceneOrder is required when regenerating a storyboard scene',
      );
    }

    const brandKit = await this.brandKitRepository.findById(
      generation.brandKitId,
    );
    const product = await this.productRepository.findById(generation.productId);
    if (!brandKit || brandKit.userId !== userId) {
      throw new BadRequestException('Live Brand Kit not found');
    }
    if (!product || product.userId !== userId) {
      throw new BadRequestException('Live Product not found');
    }

    const liveSnapshot = this.buildSnapshot(brandKit, product);
    const layers = this.buildLayers(liveSnapshot, generation.goal, {
      lengthTier: generation.lengthTier,
      feedPlatform: generation.feedPlatform,
      reelPlatform: generation.reelPlatform,
      postImageMode: generation.postImageMode,
    });

    const currentValue = this.readSectionValue(generation, input);

    const result = await this.textGenerationProvider.generateText({
      artifact: 'section-regenerate',
      sectionKey: input.sectionKey,
      layers: {
        ...layers,
        outputSchema: this.sectionOutputSchema(
          input.sectionKey,
          currentValue,
          input.sceneOrder,
        ),
      },
    });

    const updatedContent = this.applySectionResult(
      generation,
      input,
      result.text,
    );

    const updated = generation.withUpdates({
      ...updatedContent,
      textSectionRegenCount: generation.textSectionRegenCount + 1,
    });
    await this.generationRepository.update(updated);
    return { generation: updated };
  }

  private readSectionValue(
    generation: Generation,
    input: RegenerateSectionInput,
  ): string {
    const { sectionKey, sceneOrder } = input;
    switch (sectionKey) {
      case 'social.headline':
        return generation.socialPost?.headline ?? '';
      case 'social.body':
        return generation.socialPost?.body ?? '';
      case 'social.cta':
        return generation.socialPost?.cta ?? '';
      case 'social.caption':
        return generation.socialPost?.caption ?? '';
      case 'social.hashtags':
        return (generation.socialPost?.hashtags ?? []).join(' ');
      case 'storyboard.hook':
        return generation.reelStoryboard?.hook ?? '';
      case 'storyboard.attention':
        return generation.reelStoryboard?.attention ?? '';
      case 'storyboard.productDisplay':
        return generation.reelStoryboard?.productDisplay ?? '';
      case 'storyboard.viewerConnection':
        return generation.reelStoryboard?.viewerConnection ?? '';
      case 'storyboard.scene': {
        const scene = generation.reelStoryboard?.scenes.find(
          (item) => item.order === sceneOrder,
        );
        return scene?.description ?? '';
      }
      case 'reel.caption':
        return generation.reelCaption ?? '';
      default: {
        const _exhaustive: never = sectionKey;
        return _exhaustive;
      }
    }
  }

  private sectionOutputSchema(
    sectionKey: TextSectionKey,
    currentValue: string,
    sceneOrder?: number,
  ): string {
    const current = currentValue
      ? `Current value: ${currentValue}`
      : 'No current value.';
    switch (sectionKey) {
      case 'social.hashtags':
        return `${current}\nRewrite only hashtags. Return a JSON string array of hashtags.`;
      case 'storyboard.scene':
        return `${current}\nRewrite only storyboard scene #${sceneOrder}. Return plain scene description text.`;
      case 'reel.caption':
        return `${current}\nRewrite only the Reel caption. Return plain caption text.`;
      default:
        return `${current}\nRewrite only the ${sectionKey} field. Return plain text for that field only.`;
    }
  }

  private applySectionResult(
    generation: Generation,
    input: RegenerateSectionInput,
    text: string,
  ): {
    socialPost?: SocialPostContent | null;
    reelStoryboard?: ReelStoryboardContent | null;
    reelCaption?: string | null;
  } {
    const { sectionKey, sceneOrder } = input;
    const trimmed = text.trim();

    if (sectionKey.startsWith('social.')) {
      if (!generation.socialPost) {
        throw new BadRequestException('Generation has no Social Post');
      }
      const socialPost = { ...generation.socialPost };
      if (sectionKey === 'social.hashtags') {
        const parsed = this.parseJsonArray(trimmed);
        socialPost.hashtags =
          parsed ??
          trimmed
            .split(/\s+/)
            .map((tag) => tag.trim())
            .filter(Boolean);
      } else if (sectionKey === 'social.headline') {
        socialPost.headline = this.stripQuotes(trimmed);
      } else if (sectionKey === 'social.body') {
        socialPost.body = this.stripQuotes(trimmed);
      } else if (sectionKey === 'social.cta') {
        socialPost.cta = this.stripQuotes(trimmed);
      } else if (sectionKey === 'social.caption') {
        socialPost.caption = this.stripQuotes(trimmed);
      }
      return { socialPost };
    }

    if (sectionKey.startsWith('storyboard.')) {
      if (!generation.reelStoryboard) {
        throw new BadRequestException('Generation has no Reel Storyboard');
      }
      const reelStoryboard = {
        ...generation.reelStoryboard,
        scenes: generation.reelStoryboard.scenes.map((scene) => ({
          ...scene,
        })),
      };
      if (sectionKey === 'storyboard.scene') {
        const index = reelStoryboard.scenes.findIndex(
          (scene) => scene.order === sceneOrder,
        );
        if (index < 0) {
          throw new BadRequestException(
            `Storyboard scene order ${sceneOrder} not found`,
          );
        }
        reelStoryboard.scenes[index] = {
          ...reelStoryboard.scenes[index],
          description: this.stripQuotes(trimmed),
        };
      } else if (sectionKey === 'storyboard.hook') {
        reelStoryboard.hook = this.stripQuotes(trimmed);
      } else if (sectionKey === 'storyboard.attention') {
        reelStoryboard.attention = this.stripQuotes(trimmed);
      } else if (sectionKey === 'storyboard.productDisplay') {
        reelStoryboard.productDisplay = this.stripQuotes(trimmed);
      } else if (sectionKey === 'storyboard.viewerConnection') {
        reelStoryboard.viewerConnection = this.stripQuotes(trimmed);
      }
      return { reelStoryboard };
    }

    if (sectionKey === 'reel.caption') {
      return { reelCaption: this.stripQuotes(trimmed) };
    }

    throw new BadRequestException(`Unsupported section: ${sectionKey}`);
  }

  private parseJsonArray(text: string): string[] | null {
    try {
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start >= 0 && end > start) {
        const parsed: unknown = JSON.parse(text.slice(start, end + 1));
        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === 'string')
        ) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  private stripQuotes(text: string): string {
    if (
      (text.startsWith('"') && text.endsWith('"')) ||
      (text.startsWith("'") && text.endsWith("'"))
    ) {
      return text.slice(1, -1);
    }
    return text;
  }

  private async resolveBrandKit(
    userId: string,
    product: Product,
    requestedId: string | undefined,
    brandKits: BrandKit[],
  ): Promise<BrandKit> {
    const owned = new Map(brandKits.map((kit) => [kit.id, kit]));
    const linked = product.brandKitIds.filter((id) => owned.has(id));
    if (linked.length === 0) {
      throw new BadRequestException(
        'Product is not linked to one of your Brand Kits',
      );
    }

    if (requestedId) {
      if (!linked.includes(requestedId)) {
        throw new BadRequestException(
          'Selected Brand Kit is not linked to this Product',
        );
      }
      return owned.get(requestedId)!;
    }

    if (linked.length > 1) {
      throw new BadRequestException(
        'Select a Brand Kit for this Product (multiple links)',
      );
    }

    return owned.get(linked[0])!;
  }

  private buildSnapshot(
    brandKit: BrandKit,
    product: Product,
  ): GenerationSnapshot {
    return {
      brandKit: {
        id: brandKit.id,
        name: brandKit.name,
        logoUrl: brandKit.logoUrl,
        colors: brandKit.colors,
        tone: brandKit.tone,
        audience: brandKit.audience,
        thingsToAvoid: brandKit.thingsToAvoid,
        aiInstructions: brandKit.aiInstructions,
      },
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrls: product.imageUrls,
        landingPageUrl: product.landingPageUrl,
        price: product.price,
      },
    };
  }

  private buildLayers(
    snapshot: GenerationSnapshot,
    goal: Goal,
    options: {
      lengthTier: LengthTier;
      feedPlatform: FeedPlatform;
      reelPlatform: ReelPlatform;
      postImageMode: PostImageMode;
    },
  ): PromptLayers {
    const { brandKit, product } = snapshot;
    return {
      qualityAndSafety: QUALITY_AND_SAFETY,
      brandKit: [
        `Name: ${brandKit.name}`,
        `Tone: ${brandKit.tone}`,
        `Audience: ${brandKit.audience}`,
        `Avoid: ${brandKit.thingsToAvoid}`,
        brandKit.aiInstructions
          ? `AI instructions: ${brandKit.aiInstructions}`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
      product: [
        `Name: ${product.name}`,
        `Description: ${product.description}`,
        product.price ? `Price: ${product.price}` : '',
        `Landing: ${product.landingPageUrl}`,
      ]
        .filter(Boolean)
        .join('\n'),
      goalAndOptions: [
        `Goal: ${goal}`,
        `Length: ${options.lengthTier}`,
        `Feed: ${options.feedPlatform}`,
        `Reel: ${options.reelPlatform}`,
        `Post image: ${options.postImageMode}`,
      ].join('\n'),
      outputSchema: '',
    };
  }

  private parseJson<T extends object>(text: string): T | null {
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(text.slice(start, end + 1)) as T;
      }
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }

  private async waitForVideo(
    initial: Awaited<
      ReturnType<IVideoGenerationProvider['generateVideo']>
    >,
  ): Promise<Awaited<ReturnType<IVideoGenerationProvider['generateVideo']>>> {
    if (initial.status === 'completed' || initial.status === 'failed') {
      return initial;
    }

    const deadline = Date.now() + 5 * 60_000;
    let latest = initial;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      latest = await this.videoGenerationProvider.getGenerationStatus(
        initial.jobId,
      );
      if (latest.status === 'completed' || latest.status === 'failed') {
        return latest;
      }
    }

    return {
      ...latest,
      status: 'failed',
      error: latest.error ?? 'Video generation timed out',
    };
  }

  private setArm(
    arms: GenerationArmState[],
    arm: GenerationArmState['arm'],
    status: GenerationArmState['status'],
    error?: string,
  ) {
    const index = arms.findIndex((item) => item.arm === arm);
    if (index >= 0) {
      arms[index] = { arm, status, error };
    }
  }

  private rollupStatus(
    arms: GenerationArmState[],
  ): Generation['status'] {
    const statuses = arms.map((arm) => arm.status);
    if (statuses.every((status) => status === 'completed')) {
      return 'completed';
    }
    if (statuses.every((status) => status === 'failed')) {
      return 'failed';
    }
    if (statuses.some((status) => status === 'failed')) {
      return 'partial';
    }
    if (statuses.some((status) => status === 'processing')) {
      return 'processing';
    }
    return 'accepted';
  }
}
