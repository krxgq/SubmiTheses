import { Queue } from 'bullmq';
import { bullMQConnection } from '../lib/redis';

/**
 * Job data types for deadline queue
 */
export interface DeadlineReminderJob {
  projectId: number;
  days: number; // Days before deadline (e.g., 7, 3, 1)
}

export interface ProjectLockJob {
  projectId: number;
}

/**
 * Deadline Queue
 * Handles scheduling of deadline reminders and project auto-locks
 */
export const deadlineQueue = new Queue('deadlines', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 60000, // Start with 1 minute delay, then exponential
    },
    removeOnComplete: {
      age: 7 * 24 * 60 * 60, // Keep completed jobs for 7 days
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 30 * 24 * 60 * 60, // Keep failed jobs for 30 days for debugging
    },
  },
});

/**
 * Helper function to generate unique job IDs
 * This allows us to remove/replace jobs when deadline changes
 */
export function getJobId(projectId: number, type: 'reminder' | 'lock', days?: number): string {
  // BullMQ doesn't allow ':' in job IDs — use dashes instead
  if (type === 'reminder' && days !== undefined) {
    return `project-${projectId}-reminder-${days}`;
  }
  return `project-${projectId}-lock`;
}
