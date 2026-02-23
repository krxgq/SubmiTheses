import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';

/**
 * Invitation Service - Manages user invitation tokens and password setup
 * Handles token generation, validation, password setup, and resending invitations
 */
export class InvitationService {
  // Token expiry: 30 days (in milliseconds)
  private static readonly EXPIRY_DAYS = 30;
  private static readonly EXPIRY_MS = this.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  /**
   * Generate a cryptographically secure random token
   * Uses 32 bytes (256 bits) of entropy, encoded as 64-character hex string
   * @returns 64-character hexadecimal token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create an invitation for a user
   * Generates a token, sets expiry to 30 days from now, and updates the user record
   * @param userId - UUID of the user to invite
   * @returns The generated invitation token
   */
  static async createInvitation(userId: string): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + this.EXPIRY_MS);

    // Update user with invitation token and expiry
    await prisma.users.update({
      where: { id: userId },
      data: {
        password_reset_token: token, // Reuse password_reset_token field for invitations
        password_reset_expires: expiresAt,
        email_verified: false, // User hasn't verified yet
      },
    });

    console.log(`🎫 Invitation created for user ${userId}, expires: ${expiresAt.toISOString()}`);
    return token;
  }

  /**
   * Validate an invitation token
   * Checks if the token exists in the database and hasn't expired
   * @param token - The invitation token to validate
   * @returns User object if valid, null otherwise
   */
  static async validateInvitationToken(token: string): Promise<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null> {
    if (!token || token.length !== 64) {
      return null;
    }

    // Find user by token
    const user = await prisma.users.findFirst({
      where: {
        password_reset_token: token,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        password_reset_expires: true,
        email_verified: true,
      },
    });

    if (!user) {
      return null;
    }

    // Check if token has expired
    if (!user.password_reset_expires || user.password_reset_expires < new Date()) {
      console.log(`⚠️  Invitation token expired for user ${user.email}`);
      return null;
    }

    // Check if user has already set up their password
    if (user.email_verified === true) {
      console.log(`⚠️  User ${user.email} has already completed invitation setup`);
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }

  /**
   * Complete the invitation process by setting the user's password
   * Validates the token, hashes the password, and updates the user record
   * @param token - The invitation token
   * @param password - The new password to set
   * @returns Success status and message
   */
  static async completeInvitation(
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    // Validate token
    const user = await this.validateInvitationToken(token);

    if (!user) {
      return {
        success: false,
        message: 'Invalid or expired invitation token',
      };
    }

    try {
      // Hash the password
      const passwordHash = await AuthService.hashPassword(password);

      // Update user: set password, clear token, mark as verified
      await prisma.users.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          password_reset_token: null, // Clear the invitation token
          password_reset_expires: null, // Clear the expiry
          email_verified: true, // Mark email as verified
          email_verified_at: new Date(), // Set verification timestamp
          updated_at: new Date(),
        },
      });

      console.log(`✅ User ${user.email} completed invitation and set password`);

      return {
        success: true,
        message: 'Password set successfully',
      };
    } catch (error) {
      console.error('❌ Failed to complete invitation:', error);
      return {
        success: false,
        message: 'Failed to set password. Please try again.',
      };
    }
  }

  /**
   * Resend invitation email to a user
   * Generates a new token (invalidating the old one) and sends a new email
   * @param userId - UUID of the user
   * @returns Success status and message
   */
  static async resendInvitation(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get user details
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          email_verified: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Check if user has already completed setup
      if (user.email_verified === true) {
        return {
          success: false,
          message: 'User has already set up their password',
        };
      }

      // Generate new invitation token (this invalidates the old one)
      const token = await this.createInvitation(userId);

      // Send invitation email
      await EmailService.sendInvitationEmail(user.email, user.first_name, token);

      console.log(`📧 Invitation resent to user ${user.email}`);

      return {
        success: true,
        message: 'Invitation email resent successfully',
      };
    } catch (error) {
      console.error('❌ Failed to resend invitation:', error);
      return {
        success: false,
        message: 'Failed to resend invitation. Please try again.',
      };
    }
  }
}
