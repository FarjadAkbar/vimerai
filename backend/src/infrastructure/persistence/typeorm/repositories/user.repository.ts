import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '@/core/ports/user.repository';
import { User } from '@/domain/user.entity';
import { UserEntity } from '@/infrastructure/persistence/typeorm/entities/user.entity';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async createUser(user: User): Promise<void> {
    const entity = UserEntity.fromDomain(user);
    await this.repository.save(entity);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email },
    });

    if (!entity) {
      return null;
    }

    return UserEntity.toDomain(entity);
  }

  async getUserById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    return UserEntity.toDomain(entity);
  }

  async getUserByResetToken(token: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { passwordResetToken: token },
    });

    if (!entity) {
      return null;
    }

    // Check if token is expired
    if (
      entity.passwordResetExpires &&
      entity.passwordResetExpires < new Date()
    ) {
      return null;
    }

    return UserEntity.toDomain(entity);
  }

  async updateUser(user: User): Promise<void> {
    const entity = UserEntity.fromDomain(user);
    await this.repository.save(entity);
  }

  async deleteUser(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
