import { Request, Response } from "express";
import { UserService } from "../services/users.service";
import { AuthService } from "../services/auth.service";
import { InvitationService } from "../services/invitation.service";
import { EmailService } from "../services/email.service";
import type { UserWithYear, UserRole } from "@sumbi/shared-types";

/**
 * Create new user (admin only)
 * POST /api/users
 * No password required - sends invitation email instead
 */
export async function createUser(req: Request, res: Response) {
  try {
    const { email, first_name, last_name, role, year_id } = req.body;

    // Validation - password no longer required
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create user without password (will be set via invitation email)
    const user = await AuthService.registerWithoutPassword(
      email,
      first_name,
      last_name,
      role || 'student'
    );

    // Update year_id if provided
    if (year_id !== undefined) {
      await UserService.updateUser(user.id, { year_id });
    }

    // Generate invitation token (30-day expiry)
    const token = await InvitationService.createInvitation(user.id);

    // Send invitation email — roll back user if email fails
    try {
      await EmailService.sendInvitationEmail(email, first_name, token);
    } catch (emailError) {
      await UserService.deleteUser(user.id);
      throw emailError;
    }

    return res.status(201).json({
      user,
      message: 'User created successfully. Invitation email sent.',
    });
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

/**
 * Get all users with year information
 * Admin only (enforced by middleware)
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * Get user by ID with year information
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}

/**
 * Get users by role (teacher/student/admin)
 */
export async function getUsersByRole(req: Request, res: Response) {
  try {
    const role = req.query.role as "admin" | "teacher" | "student";

    if (!role || !["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role parameter" });
    }

    const users = await UserService.getUsersByRole(role);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users by role" });
  }
}

/**
 * Get all teachers (users with teacher or admin role)
 */
export async function getTeachers(req: Request, res: Response) {
  try {
    const teachers = await UserService.getTeachers();
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch teachers" });
  }
}

/**
 * Update user profile (name, year, etc.)
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const updatedUser = await UserService.updateUser(id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user" });
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { role } = req.body;

    if (!role || !["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const updatedUser = await UserService.updateUserRole(id, role);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Note: JWT tokens remain valid until expiration (1 hour for access tokens)
    // User will see new role after token refresh or re-login
    // For immediate invalidation, implement token blacklist (Redis) or versioning

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user role" });
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user" });
  }
}

/**
 * Bulk assign year to multiple users (admin only)
 * PUT /api/users/bulk-assign-year
 */
export async function bulkAssignYear(req: Request, res: Response) {
  try {
    const { userIds, year_id } = req.body;
    const result = await UserService.bulkAssignYear(userIds, year_id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error bulk assigning year:', error);
    return res.status(500).json({ error: 'Failed to assign year' });
  }
}

/**
 * Validate invitation token
 * GET /api/users/validate-invitation?token=xxx
 * Public endpoint - no authentication required
 */
export async function validateInvitationToken(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'Token parameter is required',
      });
    }

    // Validate the token
    const user = await InvitationService.validateInvitationToken(token);

    if (!user) {
      return res.status(200).json({
        valid: false,
        error: 'Invalid or expired invitation token',
      });
    }

    return res.status(200).json({
      valid: true,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    });
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return res.status(500).json({
      valid: false,
      error: 'Failed to validate invitation token',
    });
  }
}

/**
 * Setup password using invitation token
 * POST /api/users/setup-password
 * Public endpoint - no authentication required
 */
export async function setupPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    // Validation
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Complete the invitation
    const result = await InvitationService.completeInvitation(token, password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error setting up password:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to set password. Please try again.',
    });
  }
}

/**
 * Admin-initiated password reset — sends password setup email to any user
 * POST /api/users/:id/reset-password
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const result = await InvitationService.resetPassword(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
}

/**
 * Resend invitation email
 * POST /api/users/:id/resend-invitation
 * Admin only
 */
export async function resendInvitation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Resend invitation
    const result = await InvitationService.resendInvitation(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error resending invitation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend invitation. Please try again.',
    });
  }
}
