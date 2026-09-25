import 'dotenv/config';
import app from './app.js';

// ============================================================================
// Production Environment Fail-Fast Validation
// ============================================================================
if (process.env.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
    missing.push('DATABASE_URL');
  }
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    missing.push('JWT_SECRET');
  } else if (
    process.env.JWT_SECRET === 'dev-fallback-secret-key-do-not-use-in-production' ||
    process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production'
  ) {
    console.error('FATAL CONFIGURATION ERROR: JWT_SECRET is using an insecure default placeholder in production.');
    process.exit(1);
  }

  if (missing.length > 0) {
    console.error(`FATAL CONFIGURATION ERROR: Missing required production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 MamunStore Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
