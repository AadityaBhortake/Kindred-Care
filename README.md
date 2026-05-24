<div align="center">

<img src="favicon.png" alt="Kindred Care Logo" width="80" height="80" />

# 🐾 Kindred Care

**A full-stack pet care management platform — book grooming sessions, shop essentials, and manage your pets' care all in one place.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Deployment](#-deployment)

</div>

---

## ✨ Features

### 👤 Users
- **Secure Auth** — Register & login with hashed passwords (bcryptjs) and JWT sessions
- **Dashboard** — Personalized home with upcoming bookings and quick-reorder products
- **Appointment Booking** — Schedule grooming, vet check-ups, and more with date/time selection
- **Online Store** — Browse and add pet essentials to cart, then checkout seamlessly
- **Order History** — View all past orders and upcoming appointments from the profile page
- **Profile Management** — Update name, email, and password in a dedicated settings page

### 🛡️ Admin
- **Secure Admin Login** — Separate admin authentication flow
- **Admin Dashboard** — Real-time stats: total users, bookings, revenue, and orders
- **Booking & Order Management** — View all user bookings and orders in one panel
- **Health Alert Dispatch** — Send health reminders and alerts to pet owners

### 🌐 General
- Responsive, mobile-first design
- Smooth page transitions & micro-animations
- Protected routes (user & admin)
- Deployed on Render with auto-deploy on push

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router DOM 7, Vite 8 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB (native driver v6) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Deployment** | Render (`render.yaml`) |
| **Dev Tools** | Morgan (logging), dotenv, CORS |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [MongoDB](https://www.mongodb.com/atlas) database (Atlas free tier works great)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/kindred-care.git
cd kindred-care
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/kindred_care

# JWT secret (use a long, random string)
JWT_SECRET=your_super_secret_key_here

# Server port (optional, defaults to 3000)
PORT=3000
```

> **Note:** A `.env.example` file is included as a template — never commit your real `.env`.

### 4. Run in Development

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
npm start
# Server running → http://localhost:3000
```

**Terminal 2 — Frontend (Vite dev server with HMR):**
```bash
npm run dev
# App running → http://localhost:5173
```

### 5. Build for Production

```bash
npm run build   # Outputs to /dist
npm start       # Express serves the built frontend + API
```

---

## 📁 Project Structure

```
kindred-care/
├── server/
│   ├── app.js          # Express server, middleware, route definitions
│   └── mongo.js        # MongoDB connection, all DB handlers & auth logic
│
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Navbar, footer, cart drawer wrapper
│   │   └── ProtectedRoute.jsx  # Auth & admin guard for React Router
│   │
│   ├── context/
│   │   └── AppContext.jsx      # Global state: user, token, cart
│   │
│   ├── lib/
│   │   └── api.js              # Fetch helpers, auth headers, formatters
│   │
│   ├── pages/
│   │   ├── HomePage.jsx        # Dashboard with upcoming booking & products
│   │   ├── BookingPage.jsx     # Pet appointment booking form
│   │   ├── StorePage.jsx       # Product catalog
│   │   ├── CheckoutPage.jsx    # Cart review & order placement
│   │   ├── ProfilePage.jsx     # User profile, orders & settings
│   │   ├── LoginPage.jsx       # User login
│   │   ├── RegisterPage.jsx    # User registration
│   │   ├── AdminPage.jsx       # Admin dashboard (protected)
│   │   ├── AdminLoginPage.jsx  # Admin authentication
│   │   └── NotFoundPage.jsx    # 404 fallback
│   │
│   ├── styles/                 # Global CSS design tokens & component styles
│   ├── App.jsx                 # Route definitions
│   └── main.jsx                # React entry point
│
├── public/                     # Static assets (images, icons)
├── index.html                  # HTML shell
├── vite.config.js              # Vite + React plugin config
├── render.yaml                 # Render deployment config
├── package.json
└── .gitignore
```

---

## 📡 API Reference

All API routes are prefixed with `/api`. Protected routes require a `Bearer <token>` in the `Authorization` header.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |
| `PUT` | `/api/auth/profile` | ✅ | Update name, email, or password |

### Bookings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/bookings` | ✅ | Create a new appointment |
| `GET` | `/api/my/bookings` | ✅ | Get current user's bookings |
| `GET` | `/api/bookings` | ❌ | Get all bookings (admin use) |

### Store & Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | ❌ | List all products |
| `POST` | `/api/checkout` | ✅ | Place an order |
| `GET` | `/api/my/orders` | ✅ | Get current user's orders |

### Grooming

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/grooming` | ❌ | Book a grooming session |
| `GET` | `/api/grooming` | ❌ | List all grooming appointments |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stats` | ✅ (admin) | Get platform-wide statistics |

---

## ☁️ Deployment

This project is pre-configured for **[Render](https://render.com)** via `render.yaml`.

### Deploy to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your repository — Render will detect `render.yaml` automatically
4. Add your environment variables (`MONGO_URI`, `JWT_SECRET`) in the Render dashboard
5. Hit **Deploy** — auto-deploy is enabled on every push to `main`

### Manual Deploy Steps

```
Build Command:  npm install && npm run build
Start Command:  npm start
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | Full MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs |
| `PORT` | ❌ | HTTP port (default: `3000`) |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

