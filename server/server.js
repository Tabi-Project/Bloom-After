import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/authRouter.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);

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
