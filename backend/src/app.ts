import express, { Express, Request, Response, NextFunction } from 'express';
import routes from './routes/api';
import { swaggerUi, openApiSpec, swaggerUiOptions } from './config/docs';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Backend API is running!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerUiOptions));

// Serve the OpenAPI spec as JSON
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
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