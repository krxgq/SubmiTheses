// Re-export Prisma types (for backend use)
export type { years as YearDB } from '@prisma/client';

// API Response type (what frontend receives after JSON serialization)
// Dates are converted to strings when sent over HTTP
export interface Year {
  id: bigint;
  name: string | null;
  school_id: bigint | null;
  assignment_date: string | null;
  submission_date: string | null;
  feedback_date: string | null;
  created_at: string;
}

// API Request types - accept both Date objects (from service) and strings (from API)
export interface CreateYearRequest {
  name?: string;
  assignment_date: Date | string;
  submission_date: Date | string;
  feedback_date: Date | string;
}

export interface UpdateYearRequest {
  name?: string;
  assignment_date?: Date | string;
  submission_date?: Date | string;
  feedback_date?: Date | string;
}
