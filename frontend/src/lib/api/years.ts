import { apiRequest } from './client';
import type { Year, CreateYearRequest, UpdateYearRequest } from '@sumbi/shared-types';

// Re-export types from shared-types for convenience
export type { Year, CreateYearRequest, UpdateYearRequest };

// Get all years (ordered by assignment_date descending)
export async function getAllYears(): Promise<Year[]> {
  return apiRequest<Year[]>('/years');
}

// Get current year based on date range logic
export async function getCurrentYear(): Promise<Year> {
  return apiRequest<Year>('/years/current');
}

// Get year by ID
export async function getYearById(id: bigint): Promise<Year> {
  return apiRequest<Year>(`/years/${id}`);
}

// Create new year (admin only)
export async function createYear(data: CreateYearRequest): Promise<Year> {
  return apiRequest<Year>('/years', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update year (admin only)
export async function updateYear(id: bigint, data: UpdateYearRequest): Promise<Year> {
  return apiRequest<Year>(`/years/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Delete year (admin only)
export async function deleteYear(id: bigint): Promise<void> {
  return apiRequest<void>(`/years/${id}`, {
    method: 'DELETE',
  });
}

// Get scale sets for a specific year (used for cloning)
export async function getYearScaleSetsForClone(yearId: bigint): Promise<any[]> {
  return apiRequest(`/years/${yearId}/scale-sets`);
}

// Generate suggested next year name based on latest year
// This is a frontend-only helper function
export async function generateNextYearName(): Promise<string> {
  const years = await getAllYears();
  if (years.length === 0) {
    const now = new Date();
    const currentYear = now.getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  }

  const latestYear = years[0]; // Already sorted by assignment_date desc
  if (!latestYear.name) {
    const now = new Date();
    const currentYear = now.getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  }

  // Parse format "YYYY/YYYY" and increment
  const match = latestYear.name.match(/(\d{4})\/(\d{4})/);
  if (match) {
    const startYear = parseInt(match[1]);
    const endYear = parseInt(match[2]);
    return `${startYear + 1}/${endYear + 1}`;
  }

  return latestYear.name + ' (New)';
}

// Legacy export for backwards compatibility
export const yearsApi = {
  getAll: getAllYears,
  getCurrent: getCurrentYear,
  getById: getYearById,
  create: createYear,
  update: updateYear,
  delete: deleteYear,
};
