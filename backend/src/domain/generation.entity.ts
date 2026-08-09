import type {
  FeedPlatform,
  Goal,
  LengthTier,
  PostImageMode,
  ReelPlatform,
  Tone,
} from '@/types/generation/enums';
import type {
  ArmStatus,
  GenerationArm,
  GenerationArmState,
  GenerationPath,
  PostConcept,
  PromoBeat,
} from '@/types/generation/generation';

export interface BrandKitSnapshot {
  id: string;
  name: string;
  logoUrl: string;
  colors: { primary: string; secondary: string };
  tone: Tone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
}

export interface ProductSnapshot {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price: string | null;
}

export interface GenerationSnapshot {
  brandKit: BrandKitSnapshot;
  product: ProductSnapshot;
}

export interface SocialPostContent {
  headline: string;
  body: string;
  cta: string;
  caption: string;
  hashtags: string[];
  postImageUrl: string;
  feedPlatform: FeedPlatform;
  /** Set when rendered from a Post Concept in Posts-only Generation. */
  conceptId?: string;
}

export interface ReelStoryboardContent {
  hook: string;
  attention: string;
  productDisplay: string;
  viewerConnection: string;
  scenes: Array<{ order: number; description: string }>;
}

export interface VideoShot {
  beat: PromoBeat;
  order: number;
  jobId: string | null;
  videoUrl: string | null;
  status: ArmStatus;
  error?: string;
}

export interface VideoContent {
  jobId: string | null;
  videoUrl: string | null;
  status: ArmStatus;
  lengthTier: LengthTier;
  reelPlatform: ReelPlatform;
  error?: string;
  /** Promo stitch shots; Teaser omits or uses a single implicit shot. */
  shots?: VideoShot[];
}

export class Generation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly goal: Goal,
    public readonly lengthTier: LengthTier,
    public readonly feedPlatform: FeedPlatform,
    public readonly reelPlatform: ReelPlatform,
    public readonly postImageMode: PostImageMode,
    public readonly brandKitId: string,
    public readonly productId: string,
    public readonly snapshot: GenerationSnapshot,
    public readonly arms: GenerationArmState[],
    public readonly creativeBrief: string | null,
    public readonly socialPost: SocialPostContent | null,
    public readonly reelStoryboard: ReelStoryboardContent | null,
    public readonly reelCaption: string | null,
    public readonly video: VideoContent | null,
    public readonly status:
      | 'accepted'
      | 'processing'
      | 'completed'
      | 'partial'
      | 'failed',
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly textSectionRegenCount: number = 0,
    public readonly path: GenerationPath = 'multi_arm',
    public readonly postConcepts: PostConcept[] | null = null,
    public readonly socialPosts: SocialPostContent[] = [],
  ) {}

  static create(input: {
    id: string;
    userId: string;
    goal: Goal;
    lengthTier: LengthTier;
    feedPlatform: FeedPlatform;
    reelPlatform: ReelPlatform;
    postImageMode: PostImageMode;
    brandKitId: string;
    productId: string;
    snapshot: GenerationSnapshot;
    path?: GenerationPath;
  }): Generation {
    const now = new Date();
    const path = input.path ?? 'multi_arm';
    const armNames: GenerationArm[] =
      path === 'posts_only'
        ? ['post-concepts']
        : [
            'creative-brief',
            'social-post',
            'reel-storyboard',
            'reel-caption',
            'video',
          ];
    const arms: GenerationArmState[] = armNames.map((arm) => ({
      arm,
      status: 'pending' as ArmStatus,
    }));

    return new Generation(
      input.id,
      input.userId,
      input.goal,
      input.lengthTier,
      input.feedPlatform,
      input.reelPlatform,
      input.postImageMode,
      input.brandKitId,
      input.productId,
      input.snapshot,
      arms,
      null,
      null,
      null,
      null,
      null,
      'accepted',
      now,
      now,
      0,
      path,
      null,
      [],
    );
  }

  withUpdates(fields: {
    arms?: GenerationArmState[];
    creativeBrief?: string | null;
    socialPost?: SocialPostContent | null;
    reelStoryboard?: ReelStoryboardContent | null;
    reelCaption?: string | null;
    video?: VideoContent | null;
    status?: Generation['status'];
    textSectionRegenCount?: number;
    postConcepts?: PostConcept[] | null;
    socialPosts?: SocialPostContent[];
  }): Generation {
    return new Generation(
      this.id,
      this.userId,
      this.goal,
      this.lengthTier,
      this.feedPlatform,
      this.reelPlatform,
      this.postImageMode,
      this.brandKitId,
      this.productId,
      this.snapshot,
      fields.arms ?? this.arms,
      fields.creativeBrief !== undefined
        ? fields.creativeBrief
        : this.creativeBrief,
      fields.socialPost !== undefined ? fields.socialPost : this.socialPost,
      fields.reelStoryboard !== undefined
        ? fields.reelStoryboard
        : this.reelStoryboard,
      fields.reelCaption !== undefined ? fields.reelCaption : this.reelCaption,
      fields.video !== undefined ? fields.video : this.video,
      fields.status ?? this.status,
      this.createdAt,
      new Date(),
      fields.textSectionRegenCount !== undefined
        ? fields.textSectionRegenCount
        : this.textSectionRegenCount,
      this.path,
      fields.postConcepts !== undefined
        ? fields.postConcepts
        : this.postConcepts,
      fields.socialPosts !== undefined ? fields.socialPosts : this.socialPosts,
    );
  }
}
