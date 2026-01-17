import 'dotenv/config';
import app from './app';
import { startAutoLockJob } from './jobs/auto-lock.job';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Start auto-lock cron job
  startAutoLockJob();
});
