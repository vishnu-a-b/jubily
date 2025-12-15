import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import registrationRoutes from './routes/registration';
import { apiLimiter } from './middleware/rateLimit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS Configuration - Allow all origins for development AND production
const corsOptions = {
  origin: function (_origin: any, callback: any) {
    // Allow all origins - both development and production
    // This enables access from any frontend, mobile app, or API tool
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
