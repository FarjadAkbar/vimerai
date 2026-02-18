import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User as DomainUser } from '@/domain/user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true, type: 'varchar' })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires: Date | null;

  @Column({ type: 'int', default: 0 })
  singleShotCredits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: UserEntity): DomainUser {
    return new DomainUser(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.createdAt,
      entity.updatedAt,
      entity.passwordResetToken,
      entity.passwordResetExpires,
      entity.singleShotCredits ?? 0,
    );
  }

  static fromDomain(domain: DomainUser): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.passwordHash = domain.passwordHash;
    entity.passwordResetToken = domain.passwordResetToken ?? null;
    entity.passwordResetExpires = domain.passwordResetExpires ?? null;
    entity.singleShotCredits = domain.singleShotCredits ?? 0;
    if (domain.createdAt) {
      entity.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      entity.updatedAt = domain.updatedAt;
    }
    return entity;
  }
}
