import { ProjectService } from '../services/projects.service';
import { Request, Response } from 'express';
import type {
  Project,
  ProjectWithRelations,
  CreateProjectRequest,
  UpdateProjectRequest
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
    const project = await ProjectService.createProject(req.body);
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
    const project = await ProjectService.updateProject(id, req.body);

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
    const project = await ProjectService.assignStudentToProject(projectId, studentId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign student to project' });
  }
}
