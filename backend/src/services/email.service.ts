import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { generateInvitationEmail } from '../templates/invitation-email';

/**
 * Email Service - Handles sending emails via Resend HTTP API, SMTP, or console logging
 * Priority: RESEND_API_KEY > SMTP > dev mode (console)
 */
export class EmailService {
  private static transporter: Transporter | null = null;
  private static resend: Resend | null = null;
  private static isDevelopmentMode = false;
  private static useResend = false;

  /**
   * Initialize the email backend (Resend HTTP API or SMTP)
   */
  private static init(): void {
    if (this.resend || this.transporter) return;

    // Prefer Resend HTTP API (bypasses SMTP port blocks)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.useResend = true;
      console.log('✉️  Email service initialized with Resend HTTP API');
      return;
    }

    // Fallback to SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;

    if (smtpHost && smtpPort && smtpUser) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: process.env.SMTP_PASSWORD || '' },
      });
      console.log('✉️  Email service initialized with SMTP:', smtpHost);
      return;
    }

    // Dev mode: log emails to console
    console.warn('⚠️  No email provider configured. Emails will be logged to console.');
    this.isDevelopmentMode = true;
    this.transporter = nodemailer.createTransport({
      streamTransport: true, newline: 'unix', buffer: true,
    });
  }

  private static getFromAddress(): string {
    const fromName = process.env.SMTP_FROM_NAME || 'SumbiTheses System';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
    return `"${fromName}" <${fromEmail}>`;
  }

  private static getFromEmail(): string {
    return process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
  }

  private static getAppUrl(): string {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    if (process.env.NODE_ENV === 'production' && appUrl.startsWith('http://')) {
      console.warn('⚠️  WARNING: Using HTTP in production! Invitation links should use HTTPS.');
    }
    return appUrl;
  }

  static async sendInvitationEmail(
    email: string,
    firstName: string | null | undefined,
    invitationToken: string
  ): Promise<void> {
    this.init();

    try {
      const appUrl = this.getAppUrl();
      const invitationLink = `${appUrl}/setup-password?token=${invitationToken}`;
      const { subject, html, text } = generateInvitationEmail(firstName, email, invitationLink);

      // Send via Resend HTTP API
      if (this.useResend && this.resend) {
        const { error } = await this.resend.emails.send({
          from: `${process.env.SMTP_FROM_NAME || 'SumbiTheses System'} <${this.getFromEmail()}>`,
          to: email,
          subject,
          html,
          text,
        });
        if (error) throw new Error(error.message);
        console.log(`✅ Invitation email sent to ${email} via Resend`);
        return;
      }

      // Send via SMTP or dev mode
      const transporter = this.transporter!;
      const info = await transporter.sendMail({
        from: this.getFromAddress(), to: email, subject, text, html,
      });

      if (this.isDevelopmentMode) {
        console.log('\n📧 [DEV MODE] Invitation email:');
        console.log('├─ To:', email);
        console.log('├─ Subject:', subject);
        console.log('├─ Link:', invitationLink);
        console.log('└─ Token:', invitationToken);
        console.log('\n📝 Email preview:');
        console.log(text);
        console.log('\n');
      } else {
        console.log(`✅ Invitation email sent to ${email} (Message ID: ${info.messageId})`);
      }
    } catch (error) {
      console.error('❌ Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email. Please check email configuration.');
    }
  }

  static async verifyConnection(): Promise<boolean> {
    this.init();
    if (this.isDevelopmentMode) {
      console.log('✅ Email service in development mode (no connection to verify)');
      return true;
    }
    if (this.useResend) {
      console.log('✅ Resend HTTP API configured (no connection to verify)');
      return true;
    }
    try {
      await this.transporter!.verify();
      console.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection verification failed:', error);
      return false;
    }
  }
}
