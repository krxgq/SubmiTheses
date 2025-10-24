import { ProjectService } from '../services/projects.service';
import { Request, Response } from 'express';
import type { components } from '../types/api';

// Types from OpenAPI spec
type Project = components['schemas']['Project'];
type CreateProject = components['schemas']['CreateProject'];
type UpdateProject = components['schemas']['UpdateProject'];
type SchoolUser = components['schemas']['SchoolUser'];

export async function getAllProjects(req: Request, res: Response<Project[]|{ error: string }>) {
  try {
    const projects = await ProjectService.getAllProjects();
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

export async function getProjectById(req: Request<{ id: string }>, res: Response<Project | { error: string }>) {
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

export async function createProject(req: Request<{}, Project, CreateProject>, res: Response<Project | { error: string }>) {
  try {
    const project = await ProjectService.createProject(req.body);
    return res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function updateProject(req: Request<{ id: string }, Project, UpdateProject>, res: Response<Project | { error: string }>) {
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

export async function deleteProject(req: Request<{ id: string }>, res: Response) {
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

export async function getProjectStudents(req: Request<{ id: string }>, res: Response<SchoolUser[] | { error: string }>) {
  try {
    const projectId = BigInt(req.params.id);
    const students = await ProjectService.getProjectStudents(projectId);
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch project students' });
  }
}

export async function addStudentToProject(
  req: Request<{ id: string }, any, { studentId: number }>,
  res: Response
) {
  try {
    const projectId = BigInt(req.params.id);
    const studentId = BigInt(req.body.studentId);
    const projectStudent = await ProjectService.addStudentToProject(projectId, studentId);
    return res.status(201).json(projectStudent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add student to project' });
  }
}

export async function removeStudentFromProject(
  req: Request<{ id: string; studentId: string }>,
  res: Response
) {
  try {
    const projectId = BigInt(req.params.id);
    const studentId = BigInt(req.params.studentId);
    const removed = await ProjectService.removeStudentFromProject(projectId, studentId);

    if (!removed) {
      return res.status(404).json({ error: 'Student not found in project' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove student from project' });
  }
}

export async function updateProjectStudents(
  req: Request<{ id: string }, SchoolUser[], { studentIds: number[] }>,
  res: Response<SchoolUser[] | { error: string }>,
) {
  try {
    const projectId = BigInt(req.params.id);
    const studentIds = req.body.studentIds.map((id: string | number) => BigInt(id));
    const students = await ProjectService.updateProjectStudents(projectId, studentIds);
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update project students' });
  }
}
