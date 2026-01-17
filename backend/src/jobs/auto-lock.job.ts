import cron from 'node-cron';
import { ProjectService } from '../services/projects.service';

/**
 * Cron job to automatically lock projects past submission deadline
 * Runs every hour at the top of the hour (0 * * * *)
 * Locks projects where submission_date has passed
 */
export function startAutoLockJob() {
  // Run every hour: '0 * * * *'
  // For testing during development, you can use: '*/5 * * * *' (every 5 minutes)
  cron.schedule('0 * * * *', async () => {
    console.log('[AutoLockJob] Running auto-lock check...');

    try {
      const lockedCount = await ProjectService.autoLockExpiredProjects();

      if (lockedCount > 0) {
        console.log(`[AutoLockJob] ✓ Successfully locked ${lockedCount} projects`);
      } else {
        console.log('[AutoLockJob] No projects to lock');
      }
    } catch (error) {
      console.error('[AutoLockJob] ✗ Error during auto-lock:', error);
    }
  });

  console.log('[AutoLockJob] Auto-lock cron job started (runs hourly at minute 0)');
}
