import { prisma } from '../lib/prisma';
import { deadlineQueue, getJobId } from '../queues/deadline.queue';


export class DeadlineSchedulerService {
 
  static async scheduleDeadlineJobs(projectId: bigint): Promise<void> {
    try {
      console.log(`[DeadlineScheduler] Scheduling jobs for project ${projectId}`);

      const project = await prisma.projects.findUnique({
        where: { id: Number(projectId) },
        select: {
          id: true,
          title: true,
          student_id: true,
          status: true,
          year_id: true,
          years: {
            select: {
              submission_date: true,
              deadline_reminder_days: true,
            },
          },
        },
      });

      if (!project) {
        console.log(`[DeadlineScheduler] Project ${projectId} not found`);
        return;
      }

      if (!project.year_id || !project.years?.submission_date) {
        console.log(`[DeadlineScheduler] Project ${projectId} has no deadline, skipping`);
        return;
      }

      if (!project.student_id) {
        console.log(`[DeadlineScheduler] Project ${projectId} has no student, skipping`);
        return;
      }

      if (project.status === 'locked') {
        console.log(`[DeadlineScheduler] Project ${projectId} already locked, skipping`);
        return;
      }

      const deadline = new Date(project.years.submission_date);
      const now = new Date();

      if (deadline <= now) {
        console.log(`[DeadlineScheduler] Project ${projectId} deadline already passed, skipping`);
        return;
      }

      const reminderDays = project.years.deadline_reminder_days || [7, 3, 1];

      for (const days of reminderDays) {
        const reminderTime = new Date(deadline.getTime() - days * 24 * 60 * 60 * 1000);

        if (reminderTime <= now) {
          console.log(`[DeadlineScheduler] ${days}-day reminder already passed for project ${projectId}`);
          continue;
        }

        const delay = reminderTime.getTime() - now.getTime();
        const jobId = getJobId(Number(projectId), 'reminder', days);

        await deadlineQueue.add(
          'reminder',
          {
            projectId: Number(projectId),
            days,
          },
          {
            jobId,
            delay,
          }
        );

        console.log(
          `[DeadlineScheduler] Scheduled ${days}-day reminder for project ${projectId} at ${reminderTime.toISOString()}`
        );
      }

      // Schedule lock job at deadline
      const lockDelay = deadline.getTime() - now.getTime();
      const lockJobId = getJobId(Number(projectId), 'lock');

      await deadlineQueue.add(
        'lock',
        {
          projectId: Number(projectId),
        },
        {
          jobId: lockJobId,
          delay: lockDelay,
        }
      );

      console.log(`[DeadlineScheduler] Scheduled lock job for project ${projectId} at ${deadline.toISOString()}`);
    } catch (error) {
      console.error(`[DeadlineScheduler] Error scheduling jobs for project ${projectId}:`, error);
    }
  }

  /**
   * Cancel all deadline-related jobs for a project
   * Used when deadline changes or project is deleted
   */
  static async cancelDeadlineJobs(projectId: bigint): Promise<void> {
    try {
      console.log(`[DeadlineScheduler] Canceling jobs for project ${projectId}`);

      const project = await prisma.projects.findUnique({
        where: { id: Number(projectId) },
        select: {
          years: {
            select: {
              deadline_reminder_days: true,
            },
          },
        },
      });

      const reminderDays = project?.years?.deadline_reminder_days || [7, 3, 1];

      // Remove reminder jobs
      for (const days of reminderDays) {
        const jobId = getJobId(Number(projectId), 'reminder', days);
        const job = await deadlineQueue.getJob(jobId);
        if (job) {
          await job.remove();
          console.log(`[DeadlineScheduler] Removed ${days}-day reminder job for project ${projectId}`);
        }
      }

      // Remove lock job
      const lockJobId = getJobId(Number(projectId), 'lock');
      const lockJob = await deadlineQueue.getJob(lockJobId);
      if (lockJob) {
        await lockJob.remove();
        console.log(`[DeadlineScheduler] Removed lock job for project ${projectId}`);
      }
    } catch (error) {
      console.error(`[DeadlineScheduler] Error canceling jobs for project ${projectId}:`, error);
    }
  }

  /**
   * Reschedule deadline jobs for a project
   * Cancels existing jobs and schedules new ones
   * Used when year/deadline changes
   */
  static async rescheduleDeadlineJobs(projectId: bigint): Promise<void> {
    console.log(`[DeadlineScheduler] Rescheduling jobs for project ${projectId}`);
    await this.cancelDeadlineJobs(projectId);
    await this.scheduleDeadlineJobs(projectId);
  }
}
