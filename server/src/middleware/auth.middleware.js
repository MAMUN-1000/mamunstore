import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Authentication Middleware:
 * Verifies JWT token from HTTP-only cookie or Authorization header,
 * ensures the user still exists in the database, and attaches req.user.
 */
export const verifyAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization: Bearer <token> header (convenient for API testing tools)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    // 3. Verify JWT signature and expiration
    const secret = process.env.JWT_SECRET || 'dev-fallback-secret-key-do-not-use-in-production';
    const decoded = jwt.verify(token, secret);

    // 4. Verify user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user account associated with this session no longer exists.',
      });
    }

    // 5. Attach authenticated user to the request object for downstream controllers
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};
