import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './typeorm/entities/user.entity';
import { databaseConfig } from '@/infrastructure/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [UserEntity],
      migrations: ['dist/infrastructure/persistence/migrations/*.js'],
      migrationsRun: false, // Set to true to auto-run migrations on app start
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

