import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { csrfProtection } from './middleware/csrf';
import { apiRateLimiter } from './middleware/rate-limit';
import { authenticated } from './middleware/auth';
import { requireAdmin } from './middleware/authorization.middleware';
import routes from './routes/api';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { deadlineQueue } from './queues/deadline.queue';

const app: Express = express();

// Enable BigInt serialization globally
// This allows Prisma BigInt values to be sent as strings in JSON responses
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

// CORS configuration - allow frontend to access API
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true, // CRITICAL: Allows cookies to be sent from frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Security headers: sets HSTS, CSP, X-Frame-Options, and more
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/api', apiRateLimiter);
// CSRF: reject state-changing requests without X-Requested-With header
app.use('/api', csrfProtection);
app.use(express.urlencoded({ extended: true }));

// Bull Board - Queue monitoring UI
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(deadlineQueue)],
  serverAdapter: serverAdapter,
});

// Mount Bull Board UI — admin-only access
app.use('/admin/queues', authenticated, requireAdmin, serverAdapter.getRouter());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend API is running!' });
});

app.get('/health', async (req: Request, res: Response) => {
  const { cache } = await import('./lib/cache');
  
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    redis: {
      connected: cache.isConnected(),
    },
  };
  
  res.json(health);
});

app.use('/api', routes);

// 404 handler - must be after all routes
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler - must be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
