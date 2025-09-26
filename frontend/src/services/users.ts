import { api } from "../lib/api";
import { components } from "../types/api";

type User = components['schemas']['User'];
type CreateUser = components['schemas']['CreateUser'];
type UpdateUser = components['schemas']['UpdateUser'];
type SchoolUser = components['schemas']['SchoolUser'];

// Users API
export const usersApi = {
  getAll: (): Promise<User[]> =>
    api<User[]>('/users'),

  getById: (id: string): Promise<User> =>
    api<User>(`/users/${id}`),

  create: (data: CreateUser): Promise<User> =>
    api<User>('/users', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: UpdateUser): Promise<User> =>
    api<User>(`/users/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string): Promise<void> =>
    api<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
};