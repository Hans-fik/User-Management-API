import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

const app = express();

app.use(express.json());

// CORS config: allow origins from env (comma separated)
const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});