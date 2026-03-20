export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', error: 'Not authorized' });
  }

  if (!req.user.isSuperAdmin && req.user.role !== 'superadmin') {
    return res.status(403).json({
      status: 'error',
      error: 'Only super admins can perform this action.',
    });
  }

  return next();
};
