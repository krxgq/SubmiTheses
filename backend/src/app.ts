import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/api';

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
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies from Cookie header
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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