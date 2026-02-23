import { Worker, Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { NotificationService } from '../services/notifications.service';
import { deadlineQueue, DeadlineReminderJob, ProjectLockJob } from '../queues/deadline.queue';
import { bullMQConnection } from '../lib/redis';

/**
 * Process deadline reminder jobs
 * Sends notification to student about upcoming deadline
 */
async function processReminderJob(job: Job<DeadlineReminderJob>) {
  const { projectId, days } = job.data;

  console.log(`[DeadlineWorker] Processing ${days}-day reminder for project ${projectId}`);

  // Get project details
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      student_id: true,
      status: true,
      reminders_sent: true,
      years: {
        select: {
          submission_date: true,
        },
      },
    },
  });

  if (!project) {
    console.log(`[DeadlineWorker] Project ${projectId} not found, skipping`);
    return { status: 'skipped', reason: 'project_not_found' };
  }

  // Skip if project already locked/submitted
  if (project.status === 'locked') {
    console.log(`[DeadlineWorker] Project ${projectId} already locked, skipping reminder`);
    return { status: 'skipped', reason: 'already_locked' };
  }

  // Skip if no student assigned
  if (!project.student_id) {
    console.log(`[DeadlineWorker] Project ${projectId} has no student, skipping`);
    return { status: 'skipped', reason: 'no_student' };
  }

  // Skip if this reminder already sent (safety check)
  if (project.reminders_sent?.includes(days)) {
    console.log(`[DeadlineWorker] ${days}-day reminder already sent for project ${projectId}`);
    return { status: 'skipped', reason: 'already_sent' };
  }

  await NotificationService.createNotification({
    userId: project.student_id,
    type: 'deadline_reminder',
    title: 'Project deadline approaching',
    message: `Reminder: Project "${project.title}" is due in ${days} ${days === 1 ? 'day' : 'days'}`,
    metadata: {
      project_id: projectId,
      days_remaining: days,
      deadline: project.years?.submission_date?.toISOString(),
      projectTitle: project.title,
      days,
    },
  });

  await prisma.projects.update({
    where: { id: projectId },
    data: {
      reminders_sent: {
        push: days,
      },
    },
  });

  console.log(`[DeadlineWorker] Sent ${days}-day reminder for project ${projectId}`);
  return { status: 'success', projectId, days };
}

/**
 * Process project lock jobs
 * Auto-locks project when deadline is reached
 */
async function processLockJob(job: Job<ProjectLockJob>) {
  const { projectId } = job.data;

  console.log(`[DeadlineWorker] Processing auto-lock for project ${projectId}`);

  // Get project details
  const project = await prisma.projects.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      student_id: true,
      supervisor_id: true,
      opponent_id: true,
      status: true,
    },
  });

  if (!project) {
    console.log(`[DeadlineWorker] Project ${projectId} not found, skipping`);
    return { status: 'skipped', reason: 'project_not_found' };
  }

  // Skip if already locked
  if (project.status === 'locked') {
    console.log(`[DeadlineWorker] Project ${projectId} already locked`);
    return { status: 'skipped', reason: 'already_locked' };
  }

  // Find system user for locking
  const systemUser = await prisma.users.findFirst({
    where: { role: 'admin' },
    select: { id: true },
  });

  if (!systemUser) {
    throw new Error('No admin user found for auto-lock operation');
  }

  // Lock the project
  await prisma.projects.update({
    where: { id: projectId },
    data: {
      status: 'locked',
      locked_at: new Date(),
      locked_by: systemUser.id,
      lock_reason: 'automatic',
    },
  });

  // Invalidate caches
  const { cache } = await import('../lib/cache');
  await Promise.all([
    cache.delete(`project:${projectId}`),
    cache.delete('projects:all'),
  ]);

  // Log activity
  const { ActivityLogService } = await import('../services/activity-logs.service');
  await ActivityLogService.logActivity(
    BigInt(projectId),
    systemUser.id,
    'project_locked',
    'Project automatically locked (deadline reached)',
    { reason: 'automatic' }
  );

  // Notify student and teachers
  const notifications = [];

  if (project.student_id) {
    notifications.push({
      userId: project.student_id,
      title: 'Project automatically locked',
      message: `Project "${project.title}" has been automatically locked (deadline reached)`,
    });
  }

  if (project.supervisor_id) {
    notifications.push({
      userId: project.supervisor_id,
      title: 'Project automatically locked',
      message: `Project "${project.title}" was automatically locked (deadline reached)`,
    });
  }

  if (project.opponent_id) {
    notifications.push({
      userId: project.opponent_id,
      title: 'Project automatically locked',
      message: `Project "${project.title}" was automatically locked (deadline reached)`,
    });
  }

  await Promise.all(
    notifications.map(({ userId, title, message }) =>
      NotificationService.createNotification({
        userId,
        type: 'project_locked',
        title,
        message,
        metadata: { project_id: projectId, reason: 'automatic', variant: 'automatic', projectTitle: project.title },
      })
    )
  );

  console.log(`[DeadlineWorker] Successfully locked project ${projectId}`);
  return { status: 'success', projectId };
}

/**
 * Create and start the deadline worker
 */
export function startDeadlineWorker() {
  const worker = new Worker(
    'deadlines',
    async (job: Job) => {
      try {
        if (job.name === 'reminder') {
          return await processReminderJob(job as Job<DeadlineReminderJob>);
        } else if (job.name === 'lock') {
          return await processLockJob(job as Job<ProjectLockJob>);
        } else {
          console.error(`[DeadlineWorker] Unknown job type: ${job.name}`);
          throw new Error(`Unknown job type: ${job.name}`);
        }
      } catch (error) {
        console.error(`[DeadlineWorker] Error processing job ${job.id}:`, error);
        throw error; // Re-throw to trigger BullMQ retry
      }
    },
    {
      connection: bullMQConnection,
      concurrency: 5, // Process up to 5 jobs concurrently
    }
  );

  worker.on('completed', (job) => {
    console.log(`[DeadlineWorker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[DeadlineWorker] Job ${job?.id} failed:`, err);
  });

  console.log('[DeadlineWorker] Deadline worker started');

  return worker;
}
