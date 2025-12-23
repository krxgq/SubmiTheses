import { Request, Response } from "express";
import { UserService } from "../services/users.service";
import { AuthService } from "../services/auth.service";
import type { UserWithYear, UserRole } from "@sumbi/shared-types";

/**
 * Create new user (admin only)
 * POST /api/users
 */
export async function createUser(req: Request, res: Response) {
  try {
    const { email, password, first_name, last_name, role, year_id } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Create user using AuthService (reuses registration logic)
    const result = await AuthService.register(
      email,
      password,
      first_name,
      last_name,
      role || 'student'
    );

    // Update year_id if provided (AuthService doesn't handle this)
    if (year_id !== undefined) {
      const updatedUser = await UserService.updateUser(result.user.id, { year_id });
      if (updatedUser) {
        return res.status(201).json(updatedUser);
      }
    }

    return res.status(201).json(result.user);
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
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
    return res.status(500).json({ error: `Failed to fetch users, ${error}` });
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
