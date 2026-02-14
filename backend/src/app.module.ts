import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { AuthModule } from './application/auth/auth.module';
import { GeneratorModule } from './application/generator/generator.module';
import { VideosModule } from './application/videos/videos.module';
import { SubscriptionModule } from './application/subscription/subscription.module';
import { PromptsModule } from './application/prompts/prompts.module';
import { UsersModule } from './application/users/users.module';
import databaseConfig from './infrastructure/config/database.config';
import serverConfig from './infrastructure/config/server.config';
import jwtConfig from './infrastructure/config/jwt.config';
import paymentConfig from './infrastructure/config/payment.config';
import videoGenerationConfig from './infrastructure/config/video-generation.config';
import storageConfig from './infrastructure/config/storage.config';
import emailConfig from './infrastructure/config/email.config';

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
      ],
    }),
    DatabaseModule,
    AuthModule,
    GeneratorModule,
    VideosModule,
    SubscriptionModule,
    PromptsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
