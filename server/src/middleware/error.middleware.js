/**
 * Centralized Error & Exception Handling Middleware
 * Ensures safe, structured JSON responses without leaking database internals or stack traces in production.
 */

export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  // Always log server-side for observability and debugging
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // 1. JSON parsing syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload received.',
    });
  }

  // 2. Prisma specific database errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    let clientMessage = 'Database operation failed.';
    let statusCode = 400;

    switch (err.code) {
      case 'P2002': {
        const fields = err.meta?.target ? ` on field (${Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target})` : '';
        clientMessage = `A record with this unique value already exists${fields}.`;
        statusCode = 409;
        break;
      }
      case 'P2025':
        clientMessage = 'The requested record could not be found.';
        statusCode = 404;
        break;
      case 'P2003':
        clientMessage = 'Operation violates a related record constraint.';
        statusCode = 400;
        break;
      default:
        // In production, mask unspecified Prisma errors
        if (process.env.NODE_ENV === 'production') {
          clientMessage = 'A database error occurred.';
          statusCode = 500;
        } else {
          clientMessage = `Database error: ${err.message}`;
          statusCode = 500;
        }
    }

    return res.status(statusCode).json({
      success: false,
      message: clientMessage,
    });
  }

  // 3. Application errors with specified HTTP status
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, do not leak 500 internal details
  const message = (statusCode === 500 && isProduction)
    ? 'An unexpected internal error occurred. Please try again later.'
    : (err.message || 'Internal Server Error');

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
