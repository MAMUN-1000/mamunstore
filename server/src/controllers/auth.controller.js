import * as authService from '../services/auth.service.js';
import { setTokenCookie, clearTokenCookie } from '../utils/token.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ==========================================
    // Manual Input Validation (Beginner Friendly)
    // ==========================================
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Call service layer
    const { user, token } = await authService.registerUser({ name, email, password });

    // Set secure HTTP-only cookie
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log in an existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Manual Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Call service layer
    const { user, token } = await authService.loginUser({ email, password });

    // Set secure HTTP-only cookie
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log out user by clearing the auth cookie
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

/**
 * Test endpoint for verifying Admin privileges
 * GET /api/auth/admin-check
 */
export const adminCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Administrator authorization confirmed. You have elevated access.',
    data: { user: req.user },
  });
};
