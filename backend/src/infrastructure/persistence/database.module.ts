import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './typeorm/entities/user.entity';
import { VideoEntity } from './typeorm/entities/video.entity';
import { SubscriptionEntity } from './typeorm/entities/subscription.entity';
import { PlanEntity } from './typeorm/entities/plan.entity';
import { BrandKitEntity } from './typeorm/entities/brand-kit.entity';
import { ProductEntity } from './typeorm/entities/product.entity';
import { GenerationEntity } from './typeorm/entities/generation.entity';
import { PostJobEntity } from './typeorm/entities/post-job.entity';
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
          ProductEntity,
          GenerationEntity,
          PostJobEntity,
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
      ProductEntity,
      GenerationEntity,
      PostJobEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
