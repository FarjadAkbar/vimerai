import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './typeorm/entities/user.entity';
import { VideoEntity } from './typeorm/entities/video.entity';
import { SubscriptionEntity } from './typeorm/entities/subscription.entity';
import { PlanEntity } from './typeorm/entities/plan.entity';
import { BrandKitEntity } from './typeorm/entities/brand-kit.entity';
import { GenerationEntity } from './typeorm/entities/generation.entity';
import { PostJobEntity } from './typeorm/entities/post-job.entity';
import { VideoJobEntity } from './typeorm/entities/video-job.entity';
import { ImageJobEntity } from './typeorm/entities/image-job.entity';
import { TemplateEntity } from './typeorm/entities/template.entity';
import { MediaAssetEntity } from './typeorm/entities/media-asset.entity';
import { JobEntity } from './typeorm/entities/job.entity';
import { ContentItemEntity } from './typeorm/entities/content-item.entity';
import { BlitzConfigurationEntity } from './typeorm/entities/blitz-configuration.entity';
import { AiInfluencerEntity } from './typeorm/entities/ai-influencer.entity';
import databaseConfig from '@/infrastructure/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [
          UserEntity,
          VideoEntity,
          SubscriptionEntity,
          PlanEntity,
          BrandKitEntity,
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
        migrations: ['dist/infrastructure/persistence/migrations/*.js'],
        migrationsRun: false, // Set to true to auto-run migrations on app start
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      VideoEntity,
      SubscriptionEntity,
      PlanEntity,
      BrandKitEntity,
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
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
