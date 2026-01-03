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

@Module({
  imports: [
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
