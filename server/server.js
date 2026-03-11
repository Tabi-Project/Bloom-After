import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/authRouter.js';
import cookieParser from 'cookie-parser';
import resourceRouter from './routes/resourceRoute.js';
import cors from 'cors';

dotenv.config();

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://the-bloom-after.netlify.app',
];

const envAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/resources', resourceRouter);

app.get('/', (req, res) => {
  res.send('Hello World');
});

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
};

startServer();
