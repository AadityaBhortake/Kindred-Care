require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const morgan  = require('morgan');
const db      = require('./mongo');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files
const distPath = path.join(__dirname, '../dist');
const publicPath = path.join(__dirname, '../public');
const legacyPath = path.join(__dirname, '../legacy');

const hasBuild = fs.existsSync(path.join(distPath, 'index.html'));

if (hasBuild) {
  app.use(express.static(distPath));
}

app.use(express.static(publicPath));
app.use(express.static(legacyPath));
app.use(express.static(path.join(__dirname, '../'))); // Fallback for root files like index.html if needed

// ── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', db.register);
app.post('/api/auth/login',    db.login);
app.get ('/api/auth/me',       db.verifyToken, db.getMe);
app.put ('/api/auth/profile',  db.verifyToken, db.updateProfile);

// ── Pet Care Routes ──────────────────────────────────────────────────────────
app.post('/api/bookings', db.verifyToken, db.bookAppointment);
app.get ('/api/my/bookings', db.verifyToken, db.getMyBookings);
app.get ('/api/bookings', db.getBookings);

app.post('/api/checkout', db.verifyToken, db.checkoutOrder);
app.get('/api/my/orders', db.verifyToken, db.getMyOrders);

// Admin Routes
app.get('/api/admin/stats', db.verifyToken, db.getAdminStats);

app.get ('/api/products', db.getProducts);

app.post('/api/grooming', db.bookGrooming);
app.get ('/api/grooming', db.getGrooming);

// ── Admin Route (protected) ──────────────────────────────────────────────────
app.get('/api/admin/stats', db.verifyToken, db.getAdminStats);

// ── Root ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (hasBuild) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }

  return res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, async () => {
  console.log(`✅ Server running  →  http://localhost:${PORT}`);
  console.log(`🔑 Login page      →  http://localhost:${PORT}/login.html`);
  console.log(`📝 Register page   →  http://localhost:${PORT}/register.html`);
  console.log(`📊 Admin dashboard →  http://localhost:${PORT}/admin.html`);

  try {
    await db.connectDB();
    console.log('📡 MongoDB auto-check: OK');
  } catch (err) {
    console.error('❌ MongoDB auto-check: FAILED');
    console.error('   Reason:', err.message);
  }
});
