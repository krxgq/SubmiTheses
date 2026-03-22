import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';
import { JWTService } from './jwt.service';
import type { UserRole } from '@sumbi/shared-types';

/**
 * Authentication Service - Local password-based auth
 * Replaces Supabase Auth for user registration and login
 */
export class AuthService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a plain text password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user with email and password
   * Creates user in local PostgreSQL database
   */
  static async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    role: UserRole = 'student'
  ) {
    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await this.hashPassword(password);

    // Create user in public.users table (local authentication)
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role,
        email_verified: true, // Auto-verify for local auth
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = JWTService.generateTokens(
      user.id,
      user.email,
      user.role
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new user WITHOUT password (for admin-created users with email invitations)
   * Creates user with empty password - user will set password via invitation email
   */
  static async registerWithoutPassword(
    email: string,
    firstName?: string,
    lastName?: string,
    role: UserRole = 'student'
  ) {
    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Create user with empty password (will be set via invitation)
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password_hash: '', // Empty password - user will set via invitation
        first_name: firstName,
        last_name: lastName,
        role,
        email_verified: false, // Not verified until password is set
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Invalidate user-related caches since a new user was created
    await cache.delete('users:all');
    await cache.delete(`users:role:${role}`);
    // If teacher/admin, also invalidate teachers cache
    if (role === 'teacher' || role === 'admin') {
      await cache.delete('users:teachers');
    }

    // Return user object without tokens (no automatic login)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
    };
  }

  /**
   * Login or create a user from Microsoft OAuth.
   * Links to existing account if email matches, or creates a new one.
   */
  static async loginOrCreateFromMicrosoft(
    email: string,
    microsoftId: string,
    firstName: string | undefined,
    lastName: string | undefined,
    role: UserRole
  ) {
    let finalUser;

    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      // Link Microsoft ID to existing account, upgrade auth_provider if was local-only
      finalUser = await prisma.users.update({
        where: { id: existing.id },
        data: {
          microsoft_id: microsoftId,
          auth_provider: existing.auth_provider === 'local' ? 'both' : existing.auth_provider,
          first_name: firstName || existing.first_name,
          last_name: lastName || existing.last_name,
          last_login: new Date(),
        },
      });
    } else {
      // Create new Microsoft-only user (empty password_hash disables local login)
      finalUser = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          email,
          password_hash: '',
          auth_provider: 'microsoft',
          microsoft_id: microsoftId,
          first_name: firstName,
          last_name: lastName,
          role,
          email_verified: true,
          last_login: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }

    // Invalidate user caches (same pattern as registerWithoutPassword)
    await cache.delete('users:all');
    await cache.delete(`users:role:${finalUser.role}`);
    if (finalUser.role === 'teacher' || finalUser.role === 'admin') {
      await cache.delete('users:teachers');
    }

    // Generate JWT tokens for the session
    const { accessToken, refreshToken } = JWTService.generateTokens(
      finalUser.id,
      finalUser.email,
      finalUser.role
    );

    return {
      user: {
        id: finalUser.id,
        email: finalUser.email,
        role: finalUser.role,
        first_name: finalUser.first_name,
        last_name: finalUser.last_name,
        avatar_url: finalUser.avatar_url,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Set a local password for a Microsoft-only user, upgrading auth_provider to 'both'
   */
  static async setPasswordForMicrosoftUser(userId: string, password: string) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.auth_provider !== 'microsoft') {
      throw new Error('Password can only be set for Microsoft-only accounts');
    }

    const passwordHash = await this.hashPassword(password);

    const updated = await prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: passwordHash,
        auth_provider: 'both',
        updated_at: new Date(),
      },
    });

    // Invalidate caches
    await cache.delete(`user:${userId}`);
    await cache.delete('users:all');
    await cache.delete(`users:role:${updated.role}`);

    return updated;
  }

  /**
   * Link a Microsoft account to a local-only user, upgrading auth_provider to 'both'.
   * Requires the Microsoft email to match the local account email.
   */
  static async linkMicrosoftAccount(userId: string, microsoftId: string, microsoftEmail: string) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.auth_provider !== 'local') {
      throw new Error('Microsoft linking is only available for local-only accounts');
    }

    // Email must match (case-insensitive) to prevent account hijacking
    if (user.email.toLowerCase() !== microsoftEmail.toLowerCase()) {
      throw new Error('Microsoft account email does not match your account email');
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data: {
        microsoft_id: microsoftId,
        auth_provider: 'both',
        updated_at: new Date(),
      },
    });

    // Invalidate caches
    await cache.delete(`user:${userId}`);
    await cache.delete('users:all');
    await cache.delete(`users:role:${updated.role}`);

    return updated;
  }

  /**
   * Login user with email and password
   * Verifies password and returns JWT tokens
   */
  static async login(email: string, password: string, rememberMe: boolean) {
    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await this.verifyPassword(password, user.password_hash);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login timestamp
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = JWTService.generateTokens(
      user.id,
      user.email,
      user.role
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    };
  }
}
