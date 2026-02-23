import { ProjectService } from '../services/projects.service';
import { ActivityLogService } from '../services/activity-logs.service';
import { Request, Response } from 'express';
import type {
  ProjectLite,
  ProjectWithRelations,
} from '@sumbi/shared-types';

// Extend BigInt to support JSON serialization
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

// Enable BigInt serialization to JSON by converting to Number
BigInt.prototype.toJSON = function () {
  return Number(this);
};

// User type for student lists
type User = {
  id: string;
  full_name?: string | null;
  email: string;
  role: string;
};

/**
 * Get all projects with relations
 */
export async function getAllProjects(req: Request, res: Response) {
  try {
    console.log('[ProjectsController] Fetching all projects...');
    const projects = await ProjectService.getAllProjects();
    console.log('[ProjectsController] Found', projects.length, 'projects');
    console.log('[ProjectsController] Sample project:', JSON.stringify(projects[0], null, 2));
    return res.status(200).json(projects);
  } catch (error) {
    console.error('[ProjectsController] Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

/**
 * Get project by ID with relations
 */
export async function getProjectById(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const project = await ProjectService.getProjectById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch project' });
  }
}

/**
 * Create a new project
 */
export async function createProject(req: Request, res: Response) {
  try {
    const project = await ProjectService.createProject(req.body, req.user!.id);
    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

/**
 * Update an existing project
 */
export async function updateProject(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const project = await ProjectService.updateProject(id, req.body, req.user!.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

/**
 * Delete a project
 */
export async function deleteProject(req: Request, res: Response) {
  try {
    const id = BigInt(req.params.id);
    const deleted = await ProjectService.deleteProject(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}

/**
 * Assign a student to a project (replaces any existing student)
 * To unassign, pass null for studentId
 */
export async function assignStudentToProject(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const studentId = req.body.studentId; // UUID string or null
    const project = await ProjectService.assignStudentToProject(projectId, studentId, req.user!.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign student to project' });
  }
}

/**
 * Get recent activities for a project
 * Returns the last N activities (default: 5) with user information
 */
export async function getProjectActivities(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 5;

    const activities = await ActivityLogService.getRecentActivities(projectId, limit);

    return res.status(200).json({
      activities,
      total: activities.length,
    });
  } catch (error) {
    console.error('[ProjectsController] Error fetching activities:', error);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
}

/**
 * Update project status (lock/unlock/publish)
 * PUT /projects/:id/status
 * Body: { status: 'draft' | 'locked' | 'public' }
 * Permissions:
 * - Admin: can lock/unlock/publish any project
 * - Supervisor: can lock/unlock their projects
 * - Publish: admin only
 */
export async function updateProjectStatus(req: Request, res: Response) {
  try {
    const projectId = BigInt(req.params.id);
    const { status } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    console.log('[updateProjectStatus] Request:', { projectId: String(projectId), status, userId, userRole });

    if (!['draft', 'locked', 'public'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be draft, locked, or public' });
    }

    // Check permissions based on user role
    const existingProject = await ProjectService.getProjectById(projectId);
    if (!existingProject) {
      console.log('[updateProjectStatus] Project not found');
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('[updateProjectStatus] Project found:', {
      projectSupervisorId: existingProject.supervisor_id,
      projectStatus: existingProject.status
    });

    const isAdmin = userRole === 'admin';
    const isSupervisor = userRole === 'teacher' && existingProject.supervisor_id === userId;

    console.log('[updateProjectStatus] Permissions:', { isAdmin, isSupervisor });

    // Permission checks
    if (status === 'public' && !isAdmin) {
      return res.status(403).json({ error: 'Only admins can publish projects' });
    }

    if ((status === 'locked' || status === 'draft') && !isAdmin && !isSupervisor) {
      return res.status(403).json({ error: 'Only admins or supervisors can lock/unlock projects' });
    }

    let project;

    console.log('[updateProjectStatus] Calling service for status:', status);

    if (status === 'locked') {
      project = await ProjectService.lockProject(projectId, userId, 'manual');
    } else if (status === 'draft') {
      console.log('[updateProjectStatus] Calling unlockProject...');
      project = await ProjectService.unlockProject(projectId, userId);
      console.log('[updateProjectStatus] unlockProject returned:', project ? 'success' : 'null');
    } else if (status === 'public') {
      project = await ProjectService.publishProject(projectId);
    }

    if (!project) {
      console.log('[updateProjectStatus] Project is null after service call');
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('[updateProjectStatus] Success, returning project with status:', project.status);
    return res.status(200).json({
      message: `Project status updated to ${status}`,
      project
    });
  } catch (error: any) {
    console.error('[ProjectsController] Error updating project status:', error);
    return res.status(500).json({ error: error.message || 'Failed to update project status' });
  }
}

/**
 * Trigger auto-lock check manually (admin only, for testing)
 * POST /projects/auto-lock
 */
export async function triggerAutoLock(req: Request, res: Response) {
  try {
    const lockedCount = await ProjectService.autoLockExpiredProjects();

    return res.status(200).json({
      message: `Auto-locked ${lockedCount} projects`,
      lockedCount
    });
  } catch (error: any) {
    console.error('[ProjectsController] Error in auto-lock:', error);
    return res.status(500).json({ error: error.message || 'Failed to auto-lock projects' });
  }
}
