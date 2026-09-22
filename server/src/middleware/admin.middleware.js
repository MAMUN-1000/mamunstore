/**
 * Admin Authorization Middleware:
 * Must be placed after verifyAuth. Ensures the authenticated user has the 'ADMIN' role.
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }

  next();
};
