import { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@sumbi/shared-types';

/**
 * Authorization middleware factory that creates middleware to check if user has required roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param options - Additional options for authorization checks
 */
export const requireRoles = (
  allowedRoles: UserRole[],
  options?: {
    /** Whether to check if user owns the resource (for routes like /users/:userId) */
    checkOwnership?: boolean;
    /** Parameter name to extract resource ID from (e.g., 'userId', 'projectId') */
    ownershipParam?: string;
  }
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        res.status(401).json({ 
          error: 'Authentication required',
          code: 'UNAUTHENTICATED'
        });
        return;
      }

      const { role, id: userId } = req.user;

      // Check if user has one of the required roles
      if (!allowedRoles.includes(role)) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required_roles: allowedRoles,
          current_role: role
        });
        return;
      }

      // If ownership check is required and user is not admin/teacher
      if (options?.checkOwnership && options?.ownershipParam && role === 'student') {
        const resourceId = req.params[options.ownershipParam];
        
        if (!resourceId) {
          res.status(400).json({ 
            error: 'Resource ID missing from request',
            code: 'MISSING_RESOURCE_ID'
          });
          return;
        }

        // Students can only access their own resources
        if (resourceId !== userId) {
          res.status(403).json({ 
            error: 'Access denied: You can only access your own resources',
            code: 'OWNERSHIP_VIOLATION'
          });
          return;
        }
      }

      // Authorization successful
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({ 
        error: 'Internal server error during authorization',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

/**
 * Middleware to require admin role only
 * Checks database for current role to detect stale JWT tokens
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    const { prisma } = await import('../lib/prisma');
    const dbUser = await prisma.public_users.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!dbUser) {
      res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    // Check if JWT role differs from database role (stale token)
    if (dbUser.role !== req.user.role) {
      res.status(401).json({
        error: 'Your role has changed. Please refresh the page.',
        code: 'TOKEN_STALE'
      });
      return;
    }

    // Check if user is admin
    if (dbUser.role !== 'admin') {
      res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: ['admin'],
        current_role: dbUser.role
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[Auth] Error in requireAdmin:', error);
    res.status(500).json({
      error: 'Internal server error during authorization',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};

/**
 * Middleware to require admin or teacher roles
 */
export const requireAdminOrTeacher = requireRoles(['admin', 'teacher']);

/**
 * Middleware to require any authenticated user (admin, teacher, or student)
 */
export const requireAuthenticated = requireRoles(['admin', 'teacher', 'student']);

/**
 * Middleware for checking if user can access another user's data
 * Access Rules:
 * - Admin: Can access any user
 * - Teacher: Can access any user
 * - Student: Can only access their own data
 */
export const requireUserAccess = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    const userId = req.params.id;

    console.log('[Auth] User access check:', {
      requestingUserId: req.user.id,
      requestingUserRole: req.user.role,
      targetUserId: userId
    });

    // Admins and teachers can access any user
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      console.log(`[Auth] ${req.user.role} ${req.user.id} granted access to user ${userId}`);
      next();
      return;
    }

    // Students can only access themselves
    if (req.user.id === userId) {
      console.log(`[Auth] Student ${req.user.id} granted access to own data`);
      next();
      return;
    }

    console.log(`[Auth] Student ${req.user.id} denied access to user ${userId}`);
    res.status(403).json({
      error: 'Access denied',
      code: 'USER_ACCESS_DENIED'
    });
  } catch (error) {
    console.error('[Auth] Error in requireUserAccess:', error);
    res.status(500).json({
      error: 'Internal server error during authorization',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};

/**
 * Helper function to create ownership-based authorization middleware
 * Useful for routes where users can access their own data or admins/teachers can access any
 */
export const requireOwnershipOrPrivileged = (ownershipParam: string) =>
  requireRoles(['admin', 'teacher', 'student'], {
    checkOwnership: true,
    ownershipParam
  });

/**
 * Middleware for checking if user can access a project
 * Access Rules:
 * - Admin: Can access any project
 * - Student: Can access only their own projects (where student_id matches)
 * - Teacher: Can access projects where they are supervisor_id OR opponent_id
 */
export const requireProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    const projectId = req.params.id;
    if (!projectId) {
      res.status(400).json({
        error: 'Project ID is required',
        code: 'MISSING_PROJECT_ID'
      });
      return;
    }

    let projectIdBigInt: bigint;
    try {
      projectIdBigInt = BigInt(projectId);
    } catch (error) {
      console.error(`[Auth] Invalid project ID: "${projectId}"`, error);
      res.status(400).json({
        error: 'Invalid project ID format',
        code: 'INVALID_PROJECT_ID',
        received: projectId
      });
      return;
    }

    // Admins can access any project
    if (req.user.role === 'admin') {
      console.log(`[Auth] Admin ${req.user.id} granted access to project ${projectId}`);
      next();
      return;
    }

    // Fetch project with only fields needed for access check
    const { prisma } = await import('../lib/prisma');
    const project = await prisma.projects.findUnique({
      where: { id: projectIdBigInt },
      select: {
        student_id: true,
        supervisor_id: true,
        opponent_id: true,
      },
    });

    if (!project) {
      console.log(`[Auth] Project ${projectId} not found`);
      res.status(404).json({
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
      return;
    }

    // Students can only access their own projects
    if (req.user.role === 'student') {
      if (project.student_id === req.user.id) {
        console.log(`[Auth] Student ${req.user.id} granted access to their project ${projectId}`);
        next();
        return;
      }

      console.log(`[Auth] Student ${req.user.id} denied access to project ${projectId} (owner: ${project.student_id})`);
      res.status(403).json({
        error: 'Access denied to this project',
        code: 'PROJECT_ACCESS_DENIED'
      });
      return;
    }

    // Teachers can access projects where they are supervisor OR opponent
    if (req.user.role === 'teacher') {
      console.log(`[Auth] Teacher access check:`, {
        userId: req.user.id,
        supervisorId: project.supervisor_id,
        opponentId: project.opponent_id,
        isSupervisor: project.supervisor_id === req.user.id,
        isOpponent: project.opponent_id === req.user.id
      });

      if (project.supervisor_id === req.user.id || project.opponent_id === req.user.id) {
        console.log(`[Auth] Teacher ${req.user.id} granted access to project ${projectId}`);
        next();
        return;
      }

      console.log(`[Auth] Teacher ${req.user.id} denied access to project ${projectId} (not supervisor or opponent)`);
      res.status(403).json({
        error: 'Access denied to this project',
        code: 'PROJECT_ACCESS_DENIED'
      });
      return;
    }

    // Fallback: deny access
    console.log(`[Auth] Access denied for user ${req.user.id} with role ${req.user.role} to project ${projectId}`);
    res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  } catch (error) {
    console.error('[Auth] Error in requireProjectAccess:', error);
    res.status(500).json({
      error: 'Internal server error during authorization',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};

/**
 * Middleware for checking if user can modify a project
 * Modification Rules:
 * - Admin: Can modify any project
 * - Student: Can modify ONLY their own projects AND only if status is 'draft'
 * - Teacher: CANNOT modify projects (they can only review/grade)
 */
export const requireProjectModify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    const projectId = req.params.id;
    if (!projectId) {
      res.status(400).json({
        error: 'Project ID is required',
        code: 'MISSING_PROJECT_ID'
      });
      return;
    }

    let projectIdBigInt: bigint;
    try {
      projectIdBigInt = BigInt(projectId);
    } catch (error) {
      console.error(`[Auth] Invalid project ID for modify: "${projectId}"`, error);
      res.status(400).json({
        error: 'Invalid project ID format',
        code: 'INVALID_PROJECT_ID',
        received: projectId
      });
      return;
    }

    // Admin can modify any project
    if (req.user.role === 'admin') {
      console.log(`[Auth] Admin ${req.user.id} granted modify permission for project ${projectId}`);
      next();
      return;
    }

    // Teachers CANNOT modify projects (only review/grade)
    if (req.user.role === 'teacher') {
      console.log(`[Auth] Teacher ${req.user.id} denied modify permission (teachers can only review)`);
      res.status(403).json({
        error: 'Teachers cannot modify projects. You can only review and grade projects.',
        code: 'TEACHER_CANNOT_MODIFY'
      });
      return;
    }

    // Students can only modify their own draft projects
    if (req.user.role === 'student') {
      const { prisma } = await import('../lib/prisma');
      const project = await prisma.projects.findUnique({
        where: { id: projectIdBigInt },
        select: {
          student_id: true,
          status: true,
        },
      });

      if (!project) {
        console.log(`[Auth] Project ${projectId} not found`);
        res.status(404).json({
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      // Check ownership
      if (project.student_id !== req.user.id) {
        console.log(`[Auth] Student ${req.user.id} denied modify permission (not owner, owner is ${project.student_id})`);
        res.status(403).json({
          error: 'You can only modify your own projects',
          code: 'NOT_PROJECT_OWNER'
        });
        return;
      }

      // Check status - only drafts can be modified
      if (project.status !== 'draft') {
        console.log(`[Auth] Student ${req.user.id} denied modify permission (status is '${project.status}', only 'draft' can be modified)`);
        res.status(403).json({
          error: `Cannot modify project with status '${project.status}'. Only draft projects can be modified.`,
          code: 'INVALID_PROJECT_STATUS',
          current_status: project.status
        });
        return;
      }

      console.log(`[Auth] Student ${req.user.id} granted modify permission for draft project ${projectId}`);
      next();
      return;
    }

    // Fallback: deny modification
    console.log(`[Auth] Modify permission denied for user ${req.user.id} with role ${req.user.role}`);
    res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  } catch (error) {
    console.error('[Auth] Error in requireProjectModify:', error);
    res.status(500).json({
      error: 'Internal server error during authorization',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};