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
 * Middleware for checking if user can access a project (view-only)
 * Access Rules:
 * - All authenticated users (admin, teacher, student) can VIEW any project
 * - Modification/deletion permissions are handled by separate middleware
 * - Frontend components should conditionally show interactive elements based on user permissions
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

    // Verify project exists (all authenticated users can view)
    const { prisma } = await import('../lib/prisma');
    const project = await prisma.projects.findUnique({
      where: { id: projectIdBigInt },
      select: { id: true },
    });

    if (!project) {
      console.log(`[Auth] Project ${projectId} not found`);
      res.status(404).json({
        error: 'Project not found',
        code: 'PROJECT_NOT_FOUND'
      });
      return;
    }

    console.log(`[Auth] ${req.user.role} ${req.user.id} granted view access to project ${projectId}`);
    next();
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

    // Check if project is locked (fetch lock status for all roles)
    const { prisma } = await import('../lib/prisma');
    const project = await prisma.projects.findUnique({
      where: { id: projectIdBigInt },
      select: {
        student_id: true,
        supervisor_id: true,
        status: true,
        locked_by: true,
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

    // Check if project is locked (only admins can modify locked projects)
    if (project.status === 'locked' && req.user.role !== 'admin') {
      console.log(`[Auth] Project ${projectId} is locked, only admin can modify`);
      res.status(403).json({
        error: 'Project is locked and cannot be modified',
        code: 'PROJECT_LOCKED',
        locked_by: project.locked_by,
      });
      return;
    }

    // Admin can modify any project (even locked)
    if (req.user.role === 'admin') {
      console.log(`[Auth] Admin ${req.user.id} granted modify permission for project ${projectId}`);
      next();
      return;
    }

    // Students can only modify their own draft projects
    if (req.user.role === 'student') {
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

    // Teachers can modify projects where they are supervisor AND status allows it
    if (req.user.role === 'teacher') {
      // Check if project has a supervisor assigned
      if (!project.supervisor_id) {
        console.log(`[Auth] Teacher ${req.user.id} denied modify permission (project has no supervisor)`);
        res.status(403).json({
          error: 'Project has no assigned supervisor',
          code: 'NO_SUPERVISOR_ASSIGNED'
        });
        return;
      }

      // Check if user is the supervisor
      if (project.supervisor_id !== req.user.id) {
        console.log(`[Auth] Teacher ${req.user.id} denied modify permission (not supervisor, supervisor is ${project.supervisor_id})`);
        res.status(403).json({
          error: 'Only the project supervisor can modify this project',
          code: 'NOT_PROJECT_SUPERVISOR'
        });
        return;
      }

      // Check if status allows modification (draft or locked - supervisors can edit locked projects)
      if (project.status !== 'draft' && project.status !== 'locked') {
        console.log(`[Auth] Teacher ${req.user.id} denied modify permission (status is '${project.status}', only 'draft' and 'locked' can be modified)`);
        res.status(403).json({
          error: `Cannot modify projects with status '${project.status}'. Only 'draft' and 'locked' projects can be modified.`,
          code: 'INVALID_PROJECT_STATUS',
          current_status: project.status,
          allowed_statuses: ['draft', 'locked']
        });
        return;
      }

      console.log(`[Auth] Teacher ${req.user.id} granted modify permission as supervisor for project ${projectId} with status '${project.status}'`);
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

/**
 * Middleware for checking if user can delete a project
 * Deletion Rules:
 * - Admin: Can delete any project regardless of status
 * - Teacher (Supervisor): Can delete ONLY their supervised projects with status 'draft'
 * - Student: Cannot delete projects
 */
export const requireProjectDelete = async (
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
      console.error(`[Auth] Invalid project ID for delete: "${projectId}"`, error);
      res.status(400).json({
        error: 'Invalid project ID format',
        code: 'INVALID_PROJECT_ID',
        received: projectId
      });
      return;
    }

    // Admin can delete any project
    if (req.user.role === 'admin') {
      console.log(`[Auth] Admin ${req.user.id} granted delete permission for project ${projectId}`);
      next();
      return;
    }

    // Students cannot delete projects
    if (req.user.role === 'student') {
      console.log(`[Auth] Student ${req.user.id} denied delete permission (students cannot delete projects)`);
      res.status(403).json({
        error: 'Students cannot delete projects',
        code: 'STUDENT_CANNOT_DELETE'
      });
      return;
    }

    // Teachers can delete ONLY draft projects where they are supervisor
    if (req.user.role === 'teacher') {
      const { prisma } = await import('../lib/prisma');
      const project = await prisma.projects.findUnique({
        where: { id: projectIdBigInt },
        select: {
          supervisor_id: true,
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

      // Check if project has a supervisor assigned
      if (!project.supervisor_id) {
        console.log(`[Auth] Teacher ${req.user.id} denied delete permission (project has no supervisor)`);
        res.status(403).json({
          error: 'Project has no assigned supervisor',
          code: 'NO_SUPERVISOR_ASSIGNED'
        });
        return;
      }

      // Check if user is the supervisor
      if (project.supervisor_id !== req.user.id) {
        console.log(`[Auth] Teacher ${req.user.id} denied delete permission (not supervisor, supervisor is ${project.supervisor_id})`);
        res.status(403).json({
          error: 'Only the project supervisor can delete this project',
          code: 'NOT_PROJECT_SUPERVISOR'
        });
        return;
      }

      // Check if status is draft (only draft projects can be deleted)
      if (project.status !== 'draft') {
        console.log(`[Auth] Teacher ${req.user.id} denied delete permission (status is '${project.status}', only 'draft' can be deleted)`);
        res.status(403).json({
          error: `Only 'draft' projects can be deleted. Cannot delete projects with status '${project.status}'.`,
          code: 'INVALID_PROJECT_STATUS_FOR_DELETE',
          current_status: project.status,
          allowed_status: 'draft'
        });
        return;
      }

      console.log(`[Auth] Teacher ${req.user.id} granted delete permission as supervisor for draft project ${projectId}`);
      next();
      return;
    }

    // Fallback: deny deletion
    console.log(`[Auth] Delete permission denied for user ${req.user.id} with role ${req.user.role}`);
    res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  } catch (error) {
    console.error('[Auth] Error in requireProjectDelete:', error);
    res.status(500).json({
      error: 'Internal server error during authorization',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};

/**
 * Middleware for checking if user can grade a project
 * Grading Rules:
 * - Admin: Can view/modify any grades
 * - Supervisor/Opponent: Can only view/modify their own grades (blind grading)
 * - Student: Cannot submit grades
 */
export const requireGradingAccess = async (
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
        error: 'Project ID required',
        code: 'MISSING_PROJECT_ID'
      });
      return;
    }

    let projectIdBigInt: bigint;
    try {
      projectIdBigInt = BigInt(projectId);
    } catch (error) {
      res.status(400).json({
        error: 'Invalid project ID',
        code: 'INVALID_PROJECT_ID'
      });
      return;
    }

    // Admin can access all grades
    if (req.user.role === 'admin') {
      console.log(`[Auth] Admin ${req.user.id} granted grading access`);
      next();
      return;
    }

    // Students cannot grade
    if (req.user.role === 'student') {
      res.status(403).json({
        error: 'Students cannot submit grades',
        code: 'STUDENT_CANNOT_GRADE'
      });
      return;
    }

    // Teachers can only grade projects they're assigned to
    if (req.user.role === 'teacher') {
      const { prisma } = await import('../lib/prisma');
      const project = await prisma.projects.findUnique({
        where: { id: projectIdBigInt },
        select: {
          supervisor_id: true,
          opponent_id: true,
        },
      });

      if (!project) {
        res.status(404).json({
          error: 'Project not found',
          code: 'PROJECT_NOT_FOUND'
        });
        return;
      }

      const isAssigned =
        project.supervisor_id === req.user.id ||
        project.opponent_id === req.user.id;

      if (!isAssigned) {
        res.status(403).json({
          error: 'Only assigned teachers can grade this project',
          code: 'NOT_ASSIGNED_TEACHER'
        });
        return;
      }

      console.log(`[Auth] Teacher ${req.user.id} granted grading access`);
      next();
      return;
    }

    res.status(403).json({
      error: 'Access denied',
      code: 'ACCESS_DENIED'
    });
  } catch (error) {
    console.error('[Auth] Error in requireGradingAccess:', error);
    res.status(500).json({
      error: 'Authorization error',
      code: 'AUTHORIZATION_ERROR'
    });
  }
};