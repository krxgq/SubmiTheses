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
    const existing = await prisma.public_users.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await this.hashPassword(password);

    // Create user in public.users table (local authentication)
    const user = await prisma.public_users.create({
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
    const existing = await prisma.public_users.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Create user with empty password (will be set via invitation)
    const user = await prisma.public_users.create({
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
   * Login user with email and password
   * Verifies password and returns JWT tokens
   */
  static async login(email: string, password: string, rememberMe: boolean) {
    // Find user by email
    const user = await prisma.public_users.findUnique({
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
    await prisma.public_users.update({
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
