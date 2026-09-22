import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance for the application to reuse
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
