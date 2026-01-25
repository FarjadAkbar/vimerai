import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '', // Gmail App Password
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
}));
