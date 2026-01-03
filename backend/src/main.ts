import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { serverConfig } from '@/infrastructure/config/server.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: serverConfig.frontendUrl,
    credentials: true,
  });

  await app.listen(serverConfig.port);
}
void bootstrap();
