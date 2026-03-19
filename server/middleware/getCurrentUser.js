import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser.js';

const JWT_KEY = process.env.JWT_KEY || process.env.JWT_SECRET;

export const getCurrentUser = async (req, res, next) => {
  const authHeader = req.headers?.authorization || '';
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = req.cookies?.token || bearerMatch?.[1];
  console.log("hey")
  if (!token) {
    console.log("no token")
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
    console.log('Token verification error:', err);
    return res.status(401).json({ status: 'error', error: errorMessage });
  }
  // Fetch user from database without password
  const user = await AdminUser.findById(decoded.id).select('-password');

  if (!user) {
    console.log("no user")
    return res.status(401).json({ status: 'error', error: 'User not found' });
  }
  // Attach user to request
  console.log(user)
  req.user = user;
  next();
};
