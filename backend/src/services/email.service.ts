import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { generateInvitationEmail } from '../templates/invitation-email';

/**
 * Email Service - Handles sending emails via SMTP using Nodemailer
 * Supports both development (console logging) and production (SMTP) modes
 */
export class EmailService {
  private static transporter: Transporter | null = null;
  private static isDevelopmentMode = false;

  /**
   * Initialize the email transporter with SMTP configuration
   * Called automatically on first use
   */
  private static getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;

    // Development mode: log emails to console instead of sending
    if (!smtpHost || !smtpPort || !smtpUser) {
      console.warn('⚠️  SMTP not configured. Running in development mode - emails will be logged to console.');
      this.isDevelopmentMode = true;

      // Create test transporter that logs to console
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });

      return this.transporter;
    }

    // Production mode: create real SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for other ports
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASSWORD || '',
      },
    });

    console.log('✉️  Email service initialized with SMTP:', smtpHost);
    return this.transporter;
  }

  /**
   * Get the "From" address for emails
   */
  private static getFromAddress(): string {
    const fromName = process.env.SMTP_FROM_NAME || 'SumbiTheses System';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
    return `"${fromName}" <${fromEmail}>`;
  }

  /**
   * Get the application base URL for generating links
   */
  private static getAppUrl(): string {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    // Warn if using HTTP in production
    if (process.env.NODE_ENV === 'production' && appUrl.startsWith('http://')) {
      console.warn('⚠️  WARNING: Using HTTP in production! Invitation links should use HTTPS for security.');
    }

    return appUrl;
  }

  /**
   * Send invitation email to a new user with password setup link
   * @param email - Recipient email address
   * @param firstName - User's first name (optional)
   * @param invitationToken - Secure token for password setup
   * @returns Promise that resolves when email is sent
   */
  static async sendInvitationEmail(
    email: string,
    firstName: string | null | undefined,
    invitationToken: string
  ): Promise<void> {
    try {
      // Generate invitation link
      const appUrl = this.getAppUrl();
      const invitationLink = `${appUrl}/setup-password?token=${invitationToken}`;

      // Generate email content from template
      const { subject, html, text } = generateInvitationEmail(firstName, email, invitationLink);

      // Get transporter
      const transporter = this.getTransporter();

      // Send email
      const info = await transporter.sendMail({
        from: this.getFromAddress(),
        to: email,
        subject,
        text,
        html,
      });

      // Log result
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
      throw new Error('Failed to send invitation email. Please check SMTP configuration.');
    }
  }

  /**
   * Verify SMTP connection (useful for testing configuration)
   * @returns Promise that resolves to true if connection is successful
   */
  static async verifyConnection(): Promise<boolean> {
    if (this.isDevelopmentMode) {
      console.log('✅ Email service in development mode (no SMTP connection to verify)');
      return true;
    }

    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection verification failed:', error);
      return false;
    }
  }
}
