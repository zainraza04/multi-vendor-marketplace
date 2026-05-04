import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendWelcomeEmail(payload: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }) {
    const { email, firstName, lastName } = payload;
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM ?? 'no-reply@marketplace.local';

    if (!host || !port || !user || !pass) {
      this.logger.warn('SMTP is not configured. Skipping welcome email.');
      return { sent: false, reason: 'smtp_not_configured' };
    }

    const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();
    const greeting = displayName ? `Hi ${displayName},` : 'Welcome!';

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Welcome to the Marketplace',
        text: `${greeting}\n\nThanks for registering. We’re glad you’re here.`,
        html: `<p>${greeting}</p><p>Thanks for registering. We’re glad you’re here.</p>`,
      });

      return { sent: true };
    } catch (error) {
      this.logger.error('Failed to send welcome email', error as Error);
      return { sent: false, reason: 'send_failed' };
    }
  }
}
