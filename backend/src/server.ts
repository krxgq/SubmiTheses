import 'dotenv/config';
import app from './app';
import { startDeadlineWorker } from './workers/deadline.worker';

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);

  // Start BullMQ worker for deadline management
  startDeadlineWorker();
});
