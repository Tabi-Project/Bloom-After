import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/authRouter.js';
import cookieParser from 'cookie-parser';
import resourceRouter from './routes/resourceRoute.js';
import adminStatsRouter from './routes/adminStatsRouter.js';
import cors from 'cors';
import clinicsRouter from './routes/clinicsRouter.js';
import storiesRouter from './routes/storiesRouter.js';
import adminStoriesRouter from './routes/adminStoriesRouter.js';
import ngosRouter from './routes/ngosRouter.js';
import suggestionsRouter from './routes/suggestionsRouter.js';
import adminSuggestionsRouter from './routes/adminSuggestionsRouter.js';
import adminNgosRouter from './routes/adminNgosRouter.js';
import adminSettingsRouter from './routes/adminSettingsRouter.js';
import adminResourcesRouter from './routes/adminResourcesRouter.js';
import adminClinicsRouter from './routes/adminClinicsRouter.js';
import adminUploadRouter from './routes/adminUploadRouter.js';
import lifestyleRouter from './routes/lifestyleRouter.js';
import adminLifestyleRouter from './routes/adminLifestyleRouter.js';

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

app.use(express.json({ limit: '10mb' }));
app.set('trust proxy', 1);
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/resources', resourceRouter);
app.use('/api/v1/admin/stats', adminStatsRouter);
app.use('/api/v1/admin/stories', adminStoriesRouter);
app.use('/api/v1/admin/suggestions', adminSuggestionsRouter);
app.use('/api/v1/admin/ngos', adminNgosRouter);
app.use('/api/v1/admin/settings', adminSettingsRouter);
app.use('/api/v1/admin/resources', adminResourcesRouter);
app.use('/api/v1/admin/clinics', adminClinicsRouter);
app.use('/api/v1/admin/lifestyle', adminLifestyleRouter);
app.use('/api/v1/admin/upload', adminUploadRouter);
app.use('/api/v1/clinics', clinicsRouter);
app.use('/api/v1/stories', storiesRouter);
app.use('/api/v1/ngos', ngosRouter);
app.use('/api/v1/suggestions', suggestionsRouter);
app.use('/api/v1/lifestyle', lifestyleRouter);

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
