import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 45000,
    hookTimeout: 45000,
    // Run test files sequentially to prevent database connection exhaustion on cloud PostgreSQL
    fileParallelism: false,
  },
});
