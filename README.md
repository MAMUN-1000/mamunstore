# Internship E-Commerce Application

A realistic, full-stack e-commerce application designed to teach and demonstrate core web development fundamentals: REST APIs, relational database modeling, state management, and authentication.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), JavaScript, Tailwind CSS, React Router, Context API, Axios
* **Backend:** Node.js, Express.js, JavaScript, REST API
* **Database:** PostgreSQL (with Prisma ORM)
* **Authentication:** JWT & bcrypt in HTTP-only cookies

---

## 📁 Project Structure

```
internship-ecommerce/
├── client/          # React + Vite frontend application (Port 5173)
├── server/          # Express.js backend REST API (Port 5000)
├── package.json     # Root convenience scripts
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js:** v18+ (verified on v24)
* **npm:** v9+

### 1. Run the Backend API Server
Open a terminal in the root directory:
```bash
cd server
npm run dev
```
* The server will start at: `http://localhost:5000`
* Health check endpoint: `http://localhost:5000/api/health`

### 2. Run the Frontend React Application
Open a **second terminal** in the root directory:
```bash
cd client
npm run dev
```
* The Vite development server will start at: `http://localhost:5173`

---

## 📍 Development Progress

- [x] **Phase 1: Environment & Project Setup** (Completed)
- [ ] **Phase 2: Database Modeling & Prisma Setup** (Upcoming)
- [ ] **Phase 3: Backend Authentication & Middleware**
- [ ] **Phase 4: Frontend Auth, Navigation & Layout**
- [ ] **Phase 5: Product Catalog, Search & Filtering**
- [ ] **Phase 6: Shopping Cart State & Management**
- [ ] **Phase 7: Checkout & Transactional Order Placement**
- [ ] **Phase 8: Customer Order History & Reviews**
- [ ] **Phase 9: Admin Dashboard & Product Management**
- [ ] **Phase 10: Testing & Code Hardening**
- [ ] **Phase 11: Deployment & Portfolio Polish**
