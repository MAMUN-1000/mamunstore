# MamunStore — Full-Stack E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38bdf8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169e1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Tests-88_Passed_(100%25)-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46e3b7?logo=render&logoColor=white)](https://render.com/)

**MamunStore** is a modern, production-grade full-stack e-commerce web application tailored for Bangladeshi and international online shopping. Built with **React (Vite)**, **Express.js**, and **PostgreSQL (Neon with Prisma ORM)**, the platform features a comprehensive product catalog, transactional stock reservations, verified customer reviews, coupon & discount engine, customer returns/refunds workflow, and **official bKash Tokenized Checkout (Sandbox)** payment integration alongside MFS simulators and Cash on Delivery.

---

## 🌐 Live Deployments & Repository

| Service | Platform | Link |
| :--- | :--- | :--- |
| **Frontend Storefront** | Vercel | [Live Storefront](https://mamunstore.vercel.app) *(configured with SPA rewrites & API reverse-proxy)* |
| **Backend REST API** | Render | [`https://mamunstore-backend.onrender.com`](https://mamunstore-backend.onrender.com) |
| **API Health Check** | Render | [`https://mamunstore-backend.onrender.com/api/health`](https://mamunstore-backend.onrender.com/api/health) |
| **Source Code** | GitHub | [`https://github.com/MAMUN-1000/mamunstore`](https://github.com/MAMUN-1000/mamunstore) |
| **Database** | Neon | Serverless PostgreSQL with SSL connection pooling |

---

## 🚀 Key Features

### 🛍️ Customer Experience & Storefront
* **Dynamic Product Catalog**: Instant search by keywords, category auto-filtering from the homepage, price range filtering, multi-criteria sorting (price, new arrivals, popularity), and pagination.
* **Dual Currency Display**: Real-time localized pricing in Bangladeshi Taka (**৳ BDT**) with equivalent USD (**$**) reference rates.
* **Persistent Shopping Cart**: Real-time subtotal, delivery fee calculation, estimated tax, and persistent local storage syncing across browser sessions.
* **Promo / Coupon Code Engine**: Apply percentage-based or fixed-amount discount codes (e.g. `SAVE10`) with minimum order value validation and usage limits.
* **Wishlist Management**: Instant one-click addition/removal with duplicate prevention and live badge counts.
* **Verified Buyer Reviews**: Star ratings (1–5) and written feedback with server-enforced eligibility (only verified purchasers can submit reviews).
* **Order Tracking & Printable Invoices**: Detailed order receipts with lifecycle timeline badges (`PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`) and dedicated print-ready invoice view (`/orders/:id/invoice`).
* **Returns & Refunds Workflow**: Customers can initiate partial or full returns for delivered items with reason notes, view real-time refund status, and track admin resolution.
* **In-App Notification Center**: Real-time notification feed alerting users about order status changes, payment confirmations, and refunds.
* **Campus & Local Delivery Presets**: Quick auto-fill delivery addresses for campus destinations (e.g., Jahangirnagar University, Savar, Dhaka divisions).

### 💳 Payment Gateways & Checkout
* **Official bKash Tokenized Checkout (Sandbox v1.2.0-beta)**:
  * Secure server-to-server token grant with in-memory caching (up to 55 min).
  * Direct payment session creation with official bKash checkout gateway redirect.
  * Server-side `executePayment` verification on callback — backend never trusts client status.
  * Verification of paid amount against internal order total.
  * Callback idempotency to prevent duplicate charges or notifications.
  * Atomic stock reservation on checkout and automatic stock restoration upon cancellation or failure.
* **bKash Instant Simulator**: Mock mobile checkout with generated Transaction ID (`TrxID`) confirmation.
* **Nagad MFS Simulator**: Post office digital financial service simulation with instant verification.
* **Cash on Delivery (COD)**: Checkout with `Pending Cash Collection` status.
* **Visa / Mastercard Card Simulation**: Local and international card authorization testing.

### 🛡️ Admin Dashboard & Governance
* **Analytics & Metrics**: Real-time revenue summary, total order volume, inventory counts, and customer statistics.
* **Product Catalog Management**: Create new products, update existing listings (names, prices, descriptions, images, categories), and safe deletion with dependency checks.
* **Order Fulfillment Workflow**: Review incoming orders, inspect delivery addresses, and advance order status from `PENDING` → `PAID` → `SHIPPED` → `DELIVERED` → `CANCELLED`.
* **Coupon Administration**: Create fixed or percentage coupons, set expiration dates and minimum purchase values, toggle active status, and track usage.
* **Return Request Processing**: Review submitted customer return requests, approve/reject refunds, and trigger atomic inventory restocking upon approval.
* **Low-Stock Warnings**: Automated in-app alerts dispatched to administrators whenever inventory falls below minimum thresholds.

---

## 🛠️ Tech Stack Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          Vercel Production Host              │
                  │   React 18 + Vite SPA (Client Port 5173)     │
                  └──────────────────────┬───────────────────────┘
                                         │ Reverse-Proxy /api Rewrites
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          Render Production Host              │
                  │   Express.js REST API (Backend Port 5000)    │
                  └──────────────┬───────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────────────┐
         ▼                       ▼                               ▼
┌──────────────────┐   ┌───────────────────┐           ┌───────────────────┐
│ Neon PostgreSQL  │   │  bKash Sandbox    │           │ JWT & Security    │
│ Serverless DB    │   │  Tokenized API    │           │ HttpOnly Cookies  │
│ via Prisma ORM   │   │  v1.2.0-beta      │           │ Helmet & Limiter  │
└──────────────────┘   └───────────────────┘           └───────────────────┘
```

* **Frontend**: React 18, Vite, React Router DOM 6, Tailwind CSS, Lucide React, Axios.
* **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT), bcryptjs, Helmet, Express Rate Limit, Cookie Parser.
* **Database**: PostgreSQL (hosted on Neon Serverless) with SSL connection pooling.
* **Testing**: Vitest, Supertest (88 automated integration tests covering all critical workflows).
* **Payment**: bKash Tokenized Checkout API (`v1.2.0-beta`).

---

## 📁 Repository Structure

```text
mamunstore/
├── client/                      # React frontend application
│   ├── public/                  # Static assets & favicon
│   ├── src/
│   │   ├── api/                 # Axios instance with cookie credentials
│   │   ├── components/          # Reusable UI widgets (Navbar, Footer, Modals)
│   │   ├── context/             # AuthContext, CartContext, WishlistContext
│   │   ├── pages/               # Route views (HomePage, Catalog, Checkout, Admin, etc.)
│   │   ├── utils/               # Currency formatting (BDT/USD), helpers
│   │   ├── App.jsx              # Application router & route guards
│   │   └── main.jsx             # Entry point
│   ├── vercel.json              # Vercel SPA routing & backend API reverse-proxy
│   ├── vite.config.js           # Vite dev configuration
│   └── package.json
│
├── server/                      # Express.js backend REST API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (User, Product, Order, Return, etc.)
│   │   └── seed.js              # Database seeder with catalog demo data
│   ├── src/
│   │   ├── config/              # Prisma client initialization
│   │   ├── controllers/         # Request handlers (auth, order, product, bkash, etc.)
│   │   ├── middleware/          # JWT auth, admin guard, rate-limiting, error handler
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # Business logic & external APIs (bkash.service.js)
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entry point & startup validation
│   ├── tests/                   # 88 automated integration tests (Vitest)
│   ├── .env.example             # Documented environment variable template
│   └── package.json
│
├── package.json                 # Root convenience scripts
└── README.md                    # Project documentation
```

---

## 🔐 Environment Variables

### Backend Configuration (`server/.env`)

Copy `server/.env.example` to `server/.env`:

```ini
# Server Port & Mode
PORT=5000
NODE_ENV=development

# Allowed Frontend URL (CORS origin)
CLIENT_URL=http://localhost:5173

# Neon PostgreSQL Database Connection (Must include ?sslmode=require)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# JSON Web Token Secret (Min 32 characters in production)
JWT_SECRET="generate-a-strong-random-secret-key-min-32-chars"

# bKash Tokenized Checkout Configuration (v1.2.0-beta)
BKASH_BASE_URL="https://tokenized.sandbox.bka.sh/v1.2.0-beta"
BKASH_USERNAME="your-bkash-sandbox-username"
BKASH_PASSWORD="your-bkash-sandbox-password"
BKASH_APP_KEY="your-bkash-sandbox-app-key"
BKASH_APP_SECRET="your-bkash-sandbox-app-secret"
BKASH_CALLBACK_URL="http://localhost:5000/api/bkash/callback"
```

> **Security Note:** All bKash credentials, database keys, and JWT secrets are kept strictly server-side in environment variables and are never bundled or exposed to the client.

---

## 🧪 Automated Testing

The backend is backed by an automated integration test suite written with **Vitest** and **Supertest**, verifying all critical business flows against a live PostgreSQL test database:

```bash
cd server
npm test
```

### Test Coverage Highlights (88 Tests / 10 Test Suites — 100% Pass)
* `tests/auth.test.js`: User registration, password hashing, session cookies, profile retrieval.
* `tests/products.test.js`: Catalog listing, price/category filters, keyword search, admin CRUD.
* `tests/orders.test.js`: Cart validation, stock decrement, order history, status updates.
* `tests/coupons.test.js`: Percentage & fixed coupon validation, minimum totals, admin management.
* `tests/returns.test.js`: Return eligibility rules, authorization, partial returns, atomic inventory restock.
* `tests/reviews.test.js`: Verified buyer check, rating calculations, review author deletion.
* `tests/wishlist.test.js`: Add, query, list, and removal with duplicate prevention.
* `tests/authorization.test.js`: Role-Based Access Control (RBAC) boundaries across all admin endpoints.
* `tests/notifications.test.js`: In-app notification creation, unread counts, mark-as-read.
* `tests/health.test.js`: Database health check & security headers.

---

## ⚡ Getting Started Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL Database**: Local PostgreSQL or free serverless instance from [Neon](https://neon.tech/)

### 1. Clone the Repository
```bash
git clone https://github.com/MAMUN-1000/mamunstore.git
cd mamunstore
```

### 2. Configure & Start Backend
```bash
cd server
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and JWT_SECRET

# Synchronize database schema and seed demo products
npx prisma db push
node prisma/seed.js

# Start backend server
npm run dev
```
* Backend runs on: `http://localhost:5000`
* Health Check: `http://localhost:5000/api/health`

### 3. Start Frontend Storefront
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
* Storefront runs on: `http://localhost:5173`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **Auth** | | | |
| `POST` | `/api/auth/register` | Register customer account | No |
| `POST` | `/api/auth/login` | Log in and receive HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `GET` | `/api/auth/admin-check` | Verify admin authorization | Admin |
| **Products** | | | |
| `GET` | `/api/products` | Paginated product listing with filters | No |
| `GET` | `/api/products/:id` | Single product details with reviews | No |
| `POST` | `/api/products` | Create product listing | Admin |
| `PUT` | `/api/products/:id` | Update product details | Admin |
| `DELETE`| `/api/products/:id` | Delete product listing | Admin |
| **Categories** | | | |
| `GET` | `/api/categories` | List all catalog categories | No |
| **Orders** | | | |
| `POST` | `/api/orders` | Place transactional order (reserves stock) | Yes |
| `GET` | `/api/orders/my-orders`| Retrieve customer order history | Yes |
| `GET` | `/api/orders/:id` | Retrieve single order details & invoice | Yes |
| `GET` | `/api/orders/admin/all`| View all platform orders | Admin |
| `PATCH`| `/api/orders/admin/:id/status` | Update fulfillment status | Admin |
| **bKash Gateway** | | | |
| `POST` | `/api/bkash/create-payment` | Initiate bKash Sandbox payment session | Yes |
| `GET/POST`| `/api/bkash/callback` | bKash redirect callback & payment execution | Public |
| **Coupons** | | | |
| `POST` | `/api/coupons/validate`| Validate promo code and calculate discount | Yes |
| `GET` | `/api/coupons/admin/all`| List all promo coupons | Admin |
| `POST` | `/api/coupons/admin` | Create new promo coupon | Admin |
| `PATCH`| `/api/coupons/admin/:id/toggle` | Enable/disable coupon | Admin |
| `DELETE`| `/api/coupons/admin/:id`| Delete coupon | Admin |
| **Returns & Refunds** | | | |
| `POST` | `/api/returns/request` | Submit item return request | Yes |
| `GET` | `/api/returns/my-returns`| View customer return history | Yes |
| `GET` | `/api/returns/admin/all`| View all return requests | Admin |
| `PATCH`| `/api/returns/admin/:id/status` | Approve/reject return & trigger restock | Admin |
| **Reviews** | | | |
| `GET` | `/api/products/:productId/reviews` | Get product reviews & rating stats | No |
| `POST` | `/api/products/:productId/reviews` | Submit verified buyer review | Yes |
| `DELETE`| `/api/reviews/:id` | Delete review (author or admin) | Yes |
| **Wishlist** | | | |
| `GET` | `/api/wishlist` | View customer wishlist | Yes |
| `GET` | `/api/wishlist/check/:productId` | Check if product is in wishlist | Yes |
| `POST` | `/api/wishlist/toggle` | Toggle product in/out of wishlist | Yes |
| **Notifications** | | | |
| `GET` | `/api/notifications` | Fetch customer notifications & unread count | Yes |
| `PATCH`| `/api/notifications/:id/read` | Mark individual notification read | Yes |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications read | Yes |
| **Health** | | | |
| `GET` | `/api/health` | Service uptime and database connectivity | No |

---

## 💳 bKash Sandbox Testing Credentials

When testing the **bKash (Official Sandbox)** gateway flow in test mode, the checkout dialog provides live sandbox test credentials:

| Field | Sandbox Test Value |
| :--- | :--- |
| **Test Wallet Number** | `01770618575` |
| **Verification OTP** | `123456` |
| **Wallet PIN** | `12121` |

> *Note: These are public sandbox test credentials provided by bKash for developer integration testing. No real money is deducted.*

---

## 📄 License & Credits

This project was developed for educational and portfolio demonstration purposes as part of an advanced full-stack engineering internship.

* **Developer**: Mamun ([@MAMUN-1000](https://github.com/MAMUN-1000))
* **Repository**: [github.com/MAMUN-1000/mamunstore](https://github.com/MAMUN-1000/mamunstore)
