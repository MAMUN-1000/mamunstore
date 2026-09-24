import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import prisma from './config/db.js';
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
// Global Middleware
// ==========================================

// 1. CORS: Allow requests from frontend client ports
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true, // Allows cookies to be sent across origins
  })
);

// 2. Body Parsers: Parse JSON payloads and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie Parser: Parses cookies attached to client requests into req.cookies
app.use(cookieParser());

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
    console.error('Database connection error:', err.message);
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: err.message,
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

// 404 Handler for any unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
