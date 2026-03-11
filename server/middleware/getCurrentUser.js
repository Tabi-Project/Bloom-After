import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser.js';

const JWT_KEY = process.env.JWT_SECRET;

export const getCurrentUser = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ status: 'error', error: 'Not authorized' });
  }
  let decoded;

  try {
    // Verify token
    decoded = jwt.verify(token, JWT_KEY);
  } catch (err) {
    let errorMessage = 'Not authorized';
    if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token. Please log in again.';
    }
    if (err.name === 'TokenExpiredError') {
      errorMessage = 'Your session has expired. Please log in again.';
    }
    console.error(err);
    return res.status(401).json({ status: 'error', error: errorMessage });
  }
  // Fetch user from database without password
  const user = await AdminUser.findById(decoded.id).select('-password');

  if (!user) {
    return res.status(401).json({ status: 'error', error: 'User not found' });
  }
  // Attach user to request
  req.user = user;
  next();
};
