import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AuthModule } from './application/auth/auth.module';
import { GenerationModule } from './application/generation/generation.module';
import { BrandKitsModule } from './application/brand-kits/brand-kits.module';
import { ProductsModule } from './application/products/products.module';
import { VideosModule } from './application/videos/videos.module';
import { SubscriptionModule } from './application/subscription/subscription.module';
import { UsersModule } from './application/users/users.module';
import databaseConfig from './infrastructure/config/database.config';
import serverConfig from './infrastructure/config/server.config';
import jwtConfig from './infrastructure/config/jwt.config';
import paymentConfig from './infrastructure/config/payment.config';
import videoGenerationConfig from './infrastructure/config/video-generation.config';
import storageConfig from './infrastructure/config/storage.config';
import emailConfig from './infrastructure/config/email.config';
import openaiConfig from './infrastructure/config/openai.config';
import imageGenerationConfig from './infrastructure/config/image-generation.config';

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
        imageGenerationConfig,
        storageConfig,
        emailConfig,
        openaiConfig,
      ],
    }),
    DatabaseModule,
    AuthModule,
    GenerationModule,
    BrandKitsModule,
    ProductsModule,
    VideosModule,
    SubscriptionModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
