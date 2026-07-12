import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config();

console.log(process.env.DATABASE_URL,'DATABASE_URL');
export default registerAs('database', () => ({
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
}));