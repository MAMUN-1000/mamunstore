import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT with user payload
 * @param {Object} payload - { id, email, role, name }
 * @returns {string} - Signed JWT
 */
export const generateToken = (payload) => {
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'dev-fallback-secret-key-do-not-use-in-production' ||
      process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production')
  ) {
    throw new Error('A secure JWT_SECRET environment variable is strictly required in production.');
  }
  const secret = process.env.JWT_SECRET || 'dev-fallback-secret-key-do-not-use-in-production';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

/**
 * Sets an HTTP-only secure cookie with the JWT on the Express response
 * @param {Object} res - Express response object
 * @param {string} token - JWT string
 */
export const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JavaScript (e.g. XSS) from reading the cookie
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

/**
 * Clears the auth cookie from the client
 * @param {Object} res - Express response object
 */
export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};
