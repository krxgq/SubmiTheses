import type { components, paths } from '../types/api';

// Type definitions from OpenAPI spec
export type Project = components['schemas']['Project'];
export type CreateProject = components['schemas']['CreateProject'];
export type UpdateProject = components['schemas']['UpdateProject'];
export type SchoolUser = components['schemas']['SchoolUser'];
export type School = components['schemas']['School'];
export type CreateSchool = components['schemas']['CreateSchool'];
export type UpdateSchool = components['schemas']['UpdateSchool'];
export type User = components['schemas']['User'];
export type CreateUser = components['schemas']['CreateUser'];
export type UpdateUser = components['schemas']['UpdateUser'];

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new APIError(response.status, errorText);
  }

  return response.json();
}

// Projects API
export const projectsApi = {
  getAll: (): Promise<Project[]> =>
    apiRequest('/projects'),

  getById: (id: string): Promise<Project> =>
    apiRequest(`/projects/${id}`),

  create: (data: CreateProject): Promise<Project> =>
    apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProject): Promise<Project> =>
    apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    }),

  getStudents: (id: string): Promise<SchoolUser[]> =>
    apiRequest(`/projects/${id}/students`),

  addStudent: (id: string, studentId: number): Promise<void> =>
    apiRequest(`/projects/${id}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    }),

  removeStudent: (id: string, studentId: string): Promise<void> =>
    apiRequest(`/projects/${id}/students/${studentId}`, {
      method: 'DELETE',
    }),

  updateStudents: (id: string, studentIds: number[]): Promise<SchoolUser[]> =>
    apiRequest(`/projects/${id}/students`, {
      method: 'PUT',
      body: JSON.stringify({ studentIds }),
    }),
};

// Schools API
export const schoolsApi = {
  getAll: (): Promise<School[]> =>
    apiRequest('/schools'),

  getById: (id: string): Promise<School> =>
    apiRequest(`/schools/${id}`),

  create: (data: CreateSchool): Promise<School> =>
    apiRequest('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSchool): Promise<School> =>
    apiRequest(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/schools/${id}`, {
      method: 'DELETE',
    }),

  getStudents: (id: string): Promise<SchoolUser[]> =>
    apiRequest(`/schools/${id}/students`),

  getTeachers: (id: string): Promise<SchoolUser[]> =>
    apiRequest(`/schools/${id}/teachers`),
};

// Users API
export const usersApi = {
  getAll: (): Promise<User[]> =>
    apiRequest('/users'),

  getById: (id: string): Promise<User> =>
    apiRequest(`/users/${id}`),

  update: (id: string, data: UpdateUser): Promise<User> =>
    apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    apiRequest(`/users/${id}`, {
      method: 'DELETE',
    }),
};


export { APIError };

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: any;
  headers?: Record<string, string>;
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'API request failed');
  }

  return res.json();
}
