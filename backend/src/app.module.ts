import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AuthModule } from './application/auth/auth.module';
import { GeneratorModule } from './application/generator/generator.module';
import { GenerationModule } from './application/generation/generation.module';
import { BrandKitsModule } from './application/brand-kits/brand-kits.module';
import { ProductsModule } from './application/products/products.module';
import { VideosModule } from './application/videos/videos.module';
import { SubscriptionModule } from './application/subscription/subscription.module';
import { PromptsModule } from './application/prompts/prompts.module';
import { UsersModule } from './application/users/users.module';
import { KitsModule } from '@/infrastructure/kit/kits.module';
import databaseConfig from './infrastructure/config/database.config';
import serverConfig from './infrastructure/config/server.config';
import jwtConfig from './infrastructure/config/jwt.config';
import paymentConfig from './infrastructure/config/payment.config';
import videoGenerationConfig from './infrastructure/config/video-generation.config';
import storageConfig from './infrastructure/config/storage.config';
import emailConfig from './infrastructure/config/email.config';
import kitConfig from './infrastructure/config/kit.config';
import openaiConfig from './infrastructure/config/openai.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        databaseConfig,
        serverConfig,
        jwtConfig,
        paymentConfig,
        videoGenerationConfig,
        storageConfig,
        emailConfig,
        kitConfig,
        openaiConfig,
      ],
    }),
    DatabaseModule,
    KitsModule,
    AuthModule,
    GeneratorModule,
    GenerationModule,
    BrandKitsModule,
    ProductsModule,
    VideosModule,
    SubscriptionModule,
    PromptsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
