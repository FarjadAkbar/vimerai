import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from './src/infrastructure/persistence/typeorm/entities/user.entity';

// Load environment variables from .env file
config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity],
  migrations: [
    'src/infrastructure/persistence/migrations/*.ts',
    'dist/infrastructure/persistence/migrations/*.js',
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

