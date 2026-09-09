import express from 'express';
import cors from 'cors';
import { config } from './config';
import apiRoutes from './routes/api';

const app = express();

// Allowed CORS origins
const defaultAllowedOrigins = [
  'https://cafe-flow-eight.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const envOrigins = config.corsOrigin
  ? config.corsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, automated test suites)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        config.nodeEnv === 'development'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (config.nodeEnv !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CAFEFLOW API is running',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CAFEFLOW API is healthy',
    status: 'healthy',
  });
});

// Mount main API
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start listening
if (config.nodeEnv !== 'test') {
  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`☕ CAFEFLOW Backend running on port ${config.port}`);
    console.log(`🚀 API Base URL: http://localhost:${config.port}/api`);
    console.log(`✨ Environment: ${config.nodeEnv}`);
    console.log(`=========================================`);
  });
}

export default app;

