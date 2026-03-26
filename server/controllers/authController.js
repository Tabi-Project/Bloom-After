import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser.js';
import dotenv from 'dotenv';
import validator from 'validator';
import crypto from 'crypto';

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

    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Account setup is pending. Please use your invite link to activate your account.',
      });
    }

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
      {
        id: user._id,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        role: user.role || (user.isSuperAdmin ? 'superadmin' : 'moderator'),
      },
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
        role: user.role || (user.isSuperAdmin ? 'superadmin' : 'moderator'),
        status: user.status || 'active',
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

export const getSession = async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ status: 'error', error: 'Not authorized' });
  }

  return res.status(200).json({
    status: 'success',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      role: user.role || (user.isSuperAdmin ? 'superadmin' : 'moderator'),
      status: user.status || 'active',
    },
  });
};

export const validateInviteToken = async (req, res) => {
  try {
    const token = String(req.params?.token || '').trim();
    if (!token) {
      return res.status(400).json({ status: 'error', error: 'Invite token is required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await AdminUser.findOne({
      inviteTokenHash: tokenHash,
      status: 'pending',
      inviteTokenExpiresAt: { $gt: new Date() },
    }).select('email role inviteTokenExpiresAt');

    if (!user) {
      return res.status(400).json({ status: 'error', error: 'Invite token is invalid or expired.' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        email: user.email,
        role: user.role,
        expiresAt: user.inviteTokenExpiresAt,
      },
    });
  } catch (error) {
    console.error('Error validating invite token:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

export const acceptInvite = async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    const name = String(req.body?.name || '').trim();
    const password = String(req.body?.password || '');
    const confirmPassword = String(req.body?.confirmPassword || '');

    if (!token || !name || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        error: 'Token, full name, password and confirm password are required.',
      });
    }

    if (name.length < 2) {
      return res.status(400).json({ status: 'error', error: 'Full name must be at least 2 characters.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: 'error', error: 'Password must be at least 8 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: 'error', error: 'Password confirmation does not match.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await AdminUser.findOne({
      inviteTokenHash: tokenHash,
      status: 'pending',
      inviteTokenExpiresAt: { $gt: new Date() },
    }).select('+inviteTokenHash');

    if (!user) {
      return res.status(400).json({ status: 'error', error: 'Invite token is invalid or expired.' });
    }

    user.name = name;
    user.password = password;
    user.status = 'active';
    user.inviteAcceptedAt = new Date();
    user.inviteTokenHash = null;
    user.inviteTokenExpiresAt = null;

    await user.save();

    const signedToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        role: user.role || (user.isSuperAdmin ? 'superadmin' : 'moderator'),
      },
      JWT_SECRET,
      { expiresIn: '1d' },
    );

    res.cookie('token', signedToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Account activated successfully.',
      token: signedToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        role: user.role || (user.isSuperAdmin ? 'superadmin' : 'moderator'),
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};
