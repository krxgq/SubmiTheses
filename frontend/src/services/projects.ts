import { api } from "../lib/api";
import { components } from "../types/api";

type Project = components['schemas']['Project'];
type CreateProject = components['schemas']['CreateProject'];
type UpdateProject = components['schemas']['UpdateProject'];

export async function getProjects() {
  return api<Project[]>('/projects');
}

export async function createProject(data: CreateProject) {
  return api<Project>('/projects', {
    method: 'POST',
    body: data,
  });
}

export async function updateProject(id: string, data: UpdateProject) {
  return api<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteProject(id: string) {
  return api<void>(`/projects/${id}`, {
    method: 'DELETE',
  });
}
