import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './typeorm/entities/user.entity';
import { VideoEntity } from './typeorm/entities/video.entity';
import { PromptTemplateEntity } from './typeorm/entities/prompt-template.entity';
import { SubscriptionEntity } from './typeorm/entities/subscription.entity';
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
          PromptTemplateEntity,
          SubscriptionEntity,
        ],
        migrations: ['dist/infrastructure/persistence/migrations/*.js'],
        migrationsRun: false, // Set to true to auto-run migrations on app start
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      VideoEntity,
      PromptTemplateEntity,
      SubscriptionEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
