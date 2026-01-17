import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '@/core/ports/email.service';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = this.configService.get('email');
    
    if (!emailConfig?.user || !emailConfig?.password) {
      this.logger.warn(
        'Email configuration is incomplete. Email sending will be disabled. Please set EMAIL_USER and EMAIL_PASSWORD in .env',
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void> {
    const emailConfig = this.configService.get('email');
    const fromEmail = emailConfig?.from || emailConfig?.user;

    if (!this.transporter) {
      this.logger.warn(
        `Email transporter not available. Would send password reset email to: ${email}`,
      );
      this.logger.warn(`Reset URL: ${resetUrl}`);
      return;
    }

    try {
      const mailOptions = {
        from: `"VimeraAI" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Request - VimeraAI',
        html: this.getPasswordResetEmailTemplate(resetUrl),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent successfully to: ${email}`);
      this.logger.debug(`Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to: ${email}`, error);
      throw error;
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Password Reset Request</h1>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}
