import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from './src/infrastructure/persistence/typeorm/entities/user.entity';
import { VideoEntity } from './src/infrastructure/persistence/typeorm/entities/video.entity';
import { SubscriptionEntity } from './src/infrastructure/persistence/typeorm/entities/subscription.entity';
import { PlanEntity } from './src/infrastructure/persistence/typeorm/entities/plan.entity';
import { BrandKitEntity } from './src/infrastructure/persistence/typeorm/entities/brand-kit.entity';
import { ProductEntity } from './src/infrastructure/persistence/typeorm/entities/product.entity';
import { GenerationEntity } from './src/infrastructure/persistence/typeorm/entities/generation.entity';
import { PostJobEntity } from './src/infrastructure/persistence/typeorm/entities/post-job.entity';
import { VideoJobEntity } from './src/infrastructure/persistence/typeorm/entities/video-job.entity';
import { ImageJobEntity } from './src/infrastructure/persistence/typeorm/entities/image-job.entity';
import { TemplateEntity } from './src/infrastructure/persistence/typeorm/entities/template.entity';
import { MediaAssetEntity } from './src/infrastructure/persistence/typeorm/entities/media-asset.entity';
import { JobEntity } from './src/infrastructure/persistence/typeorm/entities/job.entity';
import { ContentItemEntity } from './src/infrastructure/persistence/typeorm/entities/content-item.entity';
import { BlitzConfigurationEntity } from './src/infrastructure/persistence/typeorm/entities/blitz-configuration.entity';
import { AiInfluencerEntity } from './src/infrastructure/persistence/typeorm/entities/ai-influencer.entity';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    UserEntity,
    VideoEntity,
    SubscriptionEntity,
    PlanEntity,
    BrandKitEntity,
    ProductEntity,
    GenerationEntity,
    PostJobEntity,
    VideoJobEntity,
    ImageJobEntity,
    TemplateEntity,
    MediaAssetEntity,
    JobEntity,
    ContentItemEntity,
    BlitzConfigurationEntity,
    AiInfluencerEntity,
  ],
  migrations: [
    'src/infrastructure/persistence/migrations/*.ts',
    'dist/infrastructure/persistence/migrations/*.js',
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
