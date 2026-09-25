import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import prisma from './config/db.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import returnRoutes from './routes/return.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

// ==========================================
// Global Security & Parsing Middleware
// ==========================================

// 1. Helmet: Set comprehensive security headers (XSS, clickjacking, MIME sniffing protection)
app.use(
  helmet({
    contentSecurityPolicy: false, // Leave flexible for SPA client assets
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS: Allow requests from authorized frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server, curl, mobile apps, or local Supertest)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const corsErr = new Error(`CORS blocked for origin: ${origin}`);
        corsErr.status = 403;
        callback(corsErr);
      }
    },
    credentials: true, // Allows HTTP-only cookies across origins
  })
);

// 3. Body Parsers: Parse JSON payloads and URL-encoded form data
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Cookie Parser: Parses cookies attached to client requests into req.cookies
app.use(cookieParser());

// 5. General Rate Limiter: Baseline protection against rapid automated scraping/flooding
app.use(generalLimiter);

// ==========================================
// Routes
// ==========================================

// Health Check Endpoint (used to test frontend-backend connectivity)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'E-commerce API is running healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Database Health Check Endpoint (tests PostgreSQL connectivity via Prisma)
app.get('/api/health/db', async (req, res) => {
  try {
    // Ping database with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.user.count();

    res.status(200).json({
      success: true,
      message: 'Database is connected and healthy',
      database: 'PostgreSQL',
      counts: {
        categories: categoryCount,
        products: productCount,
        users: userCount,
      },
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'production' ? 'Database unavailable' : err.message,
    });
  }
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Catalog Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Return & Refund Routes
app.use('/api/returns', returnRoutes);

// Review & Ratings Routes
app.use('/api', reviewRoutes);

// Admin Routes
app.use('/api/admin', adminRoutes);

// Wishlist Routes
app.use('/api/wishlist', wishlistRoutes);

// Coupon & Discount Routes
app.use('/api/coupons', couponRoutes);

// In-App Notification Routes
app.use('/api/notifications', notificationRoutes);

// ==========================================
// Error & 404 Handlers
// ==========================================

// 404 Handler for any unknown routes
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
