import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmUserRepository } from '@/infrastructure/persistence/typeorm/repositories/user.repository';
import { USER_REPOSITORY_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UsersModule {}
