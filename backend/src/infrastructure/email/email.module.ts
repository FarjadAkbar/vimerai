import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EMAIL_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: EmailService,
    },
  ],
  exports: [EMAIL_SERVICE_TOKEN],
})
export class EmailModule {}
