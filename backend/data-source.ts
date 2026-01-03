import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from './src/infrastructure/persistence/typeorm/entities/user.entity';

// Load environment variables from .env file
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'vimerai',
  entities: [UserEntity],
  migrations: [
    'src/infrastructure/persistence/migrations/*.ts',
    'dist/infrastructure/persistence/migrations/*.js',
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

