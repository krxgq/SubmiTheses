import { api } from "../lib/api";
import { components } from "../types/api";

type School = components['schemas']['School'];
type CreateSchool = components['schemas']['CreateSchool'];
type UpdateSchool = components['schemas']['UpdateSchool'];
type SchoolUser = components['schemas']['SchoolUser'];
type User = components['schemas']['User'];
type UpdateUser = components['schemas']['UpdateUser'];

// Schools API
export const schoolsApi = {
  getAll: (): Promise<School[]> =>
    api<School[]>('/schools'),

  getById: (id: string): Promise<School> =>
    api<School>(`/schools/${id}`),

  create: (data: CreateSchool): Promise<School> =>
    api<School>('/schools', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: UpdateSchool): Promise<School> =>
    api<School>(`/schools/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string): Promise<void> =>
    api<void>(`/schools/${id}`, {
      method: 'DELETE',
    }),

  getStudents: (id: string): Promise<SchoolUser[]> =>
    api<SchoolUser[]>(`/schools/${id}/students`),

  getTeachers: (id: string): Promise<SchoolUser[]> =>
    api<SchoolUser[]>(`/schools/${id}/teachers`),
};
