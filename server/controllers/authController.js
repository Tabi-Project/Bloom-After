import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser.js';
import dotenv from 'dotenv';
import validator from 'validator';

dotenv.config();
const JWT_SECRET = process.env.JWT_KEY || process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

export const login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;
    console.log('Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user by email
    const user = await AdminUser.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found:', user.email);

    // Compare passwords from bcrypt
    const passwordMatch = await user.comparePassword(password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is missing!');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, isSuperAdmin: user.isSuperAdmin },
      JWT_SECRET,
      {
        expiresIn: '1d',
      },
    );

    // Set cookie and return response
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};
export const logout = (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    })
    .status(200)
    .json({ message: 'Logged out successfully' });
};
