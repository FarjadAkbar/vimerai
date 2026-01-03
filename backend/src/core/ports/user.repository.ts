import { User } from '@/domain/user.entity';

export interface IUserRepository {
  createUser(user: User): Promise<void>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  getUserByResetToken(token: string): Promise<User | null>;
  updateUser(user: User): Promise<void>;
  deleteUser(id: string): Promise<void>;
}
