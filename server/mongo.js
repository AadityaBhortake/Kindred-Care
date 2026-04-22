require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'pet_care';
const JWT_SECRET = process.env.JWT_SECRET || 'petcare_secret';

const client = new MongoClient(MONGO_URI);
let dbConnected = false;

async function connectDB() {
  if (!dbConnected) {
    await client.connect();
    dbConnected = true;
    console.log(`✅ MongoDB connected: ${MONGO_URI} | DB: ${DB_NAME}`);
  }
  return client.db(DB_NAME);
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const db = await connectDB();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: 'user',
      createdAt: new Date()
    };
    const result = await db.collection('users').insertOne(user);

    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const db = await connectDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
}

// Middleware: verify JWT token from Authorization header
function verifyToken(req, res, next) {
  const auth = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'Access denied. Please log in.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
}

// GET /api/auth/me — verify token and return user info
async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

async function bookAppointment(req, res) {
  try {
    const db = await connectDB();
    const { userId } = req.user;
    const booking = { ...req.body, userId, createdAt: new Date() };
    const result = await db.collection('bookings').insertOne(booking);
    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: { ...booking, _id: result.insertedId }
    });
  } catch (error) {
    console.error('bookAppointment error:', error);
    res.status(500).json({ success: false, message: 'Booking failed' });
  }
}

async function getMyBookings(req, res) {
  try {
    const db = await connectDB();
    const { userId } = req.user;
    let query = { userId: userId };
    
    // Add ObjectId check only if userId is a valid 24-char hex string
    if (userId && userId.length === 24 && /^[0-9a-fA-F]+$/.test(userId)) {
        query = { $or: [{ userId: userId }, { userId: new ObjectId(userId) }] };
    }
    
    console.log(`🔍 Fetching bookings for user: ${userId}`);
    const bookings = await db.collection('bookings')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ success: false, message: 'Error fetching your bookings' });
  }
}

async function getBookings(req, res) {
  try {
    const db = await connectDB();
    const bookings = await db.collection('bookings').find().sort({ createdAt: -1 }).toArray();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ success: false, message: 'Error fetching bookings' });
  }
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

async function checkoutOrder(req, res) {
  try {
    const db = await connectDB();
    const { userId } = req.user;
    const orderId = 'ORD-' + Math.floor(Math.random() * 1_000_000);
    const order = { ...req.body, userId, orderId, createdAt: new Date() };
    await db.collection('orders').insertOne(order);
    res.status(201).json({ success: true, message: 'Order placed successfully!', orderId });
  } catch (error) {
    console.error('checkoutOrder error:', error);
    res.status(500).json({ success: false, message: 'Checkout failed' });
  }
}

async function getMyOrders(req, res) {
  try {
    const db = await connectDB();
    const { userId } = req.user;
    let query = { userId: userId };

    if (userId && userId.length === 24 && /^[0-9a-fA-F]+$/.test(userId)) {
        query = { $or: [{ userId: userId }, { userId: new ObjectId(userId) }] };
    }

    console.log(`🔍 Fetching orders for user: ${userId}`);
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(orders);
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({ success: false, message: 'Error fetching your orders' });
  }
}

async function getOrders(req, res) {
  try {
    const db = await connectDB();
    const orders = await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
    res.status(200).json(orders);
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

const SEED_PRODUCTS = [
  // FOOD
  {
    name: 'Premium Puppy Kibble',
    description: 'Ancient Grains & Organic Chicken • 5kg',
    price: 3360,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9a36abb?w=400'
  },
  {
    name: 'Royal Canine Feast',
    description: 'Grain-Free Lamb & Sweet Potato • 3kg',
    price: 2799,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
  },
  {
    name: 'Feline Delight Mix',
    description: 'Ocean Fish & Chicken Blend • 2kg',
    price: 1899,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'
  },
  {
    name: 'Adult Cat Ocean Fish',
    description: 'Wild-Caught Salmon & Brown Rice • 4kg',
    price: 2500,
    category: 'Food',
    image: 'https://loremflickr.com/400/400/pet,food?lock=1'
  },
  {
    name: 'Kitten Wellness Pate',
    description: 'Tender Chicken & Liver Recipe • 12 cans',
    price: 1450,
    category: 'Food',
    image: 'https://loremflickr.com/400/400/pet,food?lock=2'
  },
  {
    name: 'Senior Dog Joint Diet',
    description: 'Low-Fat Turkey with Glucosamine • 3kg',
    price: 2900,
    category: 'Food',
    image: 'https://loremflickr.com/400/400/pet,food?lock=3'
  },

  // ACCESSORIES
  {
    name: 'Ergonomic Pet Bed',
    description: 'Orthopedic memory foam for all pets',
    price: 4500,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,bed?lock=1'
  },
  {
    name: 'Premium Leather Collar',
    description: 'Handcrafted genuine leather with brass fittings',
    price: 1200,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,collar?lock=1'
  },
  {
    name: 'Interactive Puzzle Toy',
    description: 'Mental stimulation for curious minds',
    price: 850,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,toy?lock=1'
  },
  {
    name: 'Auto-Refill Water Dispenser',
    description: 'Gravity-fed 2L capacity',
    price: 1400,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,bowl?lock=1'
  },
  {
    name: 'Travel Carrier Bag',
    description: 'Airline approved, breathable mesh design',
    price: 3200,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/pet,carrier?lock=1'
  },
  {
    name: 'Durable Chew Ring',
    description: 'Tough rubber toy for aggressive chewers',
    price: 600,
    category: 'Accessories',
    image: 'https://loremflickr.com/400/400/dog,toy?lock=2'
  },

  // HEALTH
  {
    name: 'Vita-Pet Supplement',
    description: 'Multi-Vitamin Chews for All Breeds • 60 pcs',
    price: 1299,
    category: 'Health',
    image: 'https://images.unsplash.com/photo-1582797493098-23d8d0cc6769?w=400'
  },
  {
    name: 'ZenBites Calming Chews',
    description: 'Natural relief for travel and storms • 30ct',
    price: 2280,
    category: 'Health',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhDuHxXgN4VO2N7nJrENh8IA9cc2NrKGm6AfSgNzEs_75fjCtLNvI9Gt6E5_S2m5AWmKxOUIiWGphzbLYJdTXsQ7WcrW42vjU6Mp_IaMSw_ZNzNdoL-R8eXi7XRRSI2GwPpi7pA2LaKQvLzRF7KseLCowOuxgI8wIa7PPE-zb6MNRSZvdrYwrpO9sJT7XheRQHQ8SI5RpuY5Y196lLJBHZJiVpKSIJIOJ26XV9KuhPVWOqrtXwx4IUeXU5RZTVDkeZbBrp9q5L0Q'
  },
  {
    name: 'Lavender Fur Mist',
    description: 'Deodorizing spray with organic oils • 250ml',
    price: 1520,
    category: 'Health',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthByd8p3LLoN8-GrKevsckA8JSBQ85_W9kRt7VirIWH8AQAqeMYhuqyFkR-Opm_y5RE5fG9QVNC5UQzkMalxpPli8u1tN-PEHDi08FsT9CglKSsIzI4M96XSTYuqeitxX70LIWGR7TzRkAJzeuhWlGOyJ9PblxnlfN46F29kRsGogGjTTx7J0AqCPqQ3ndB3bCdhG-GfrdrKM97kNFOvBnROTrY2arnGQD9jymYFbnX_I9DF-mcRdqAKmNTppQfVrtPCAM4ZorxY'
  },
  {
    name: 'Dental Care Water Additive',
    description: 'Helps fight plaque and tartar • 500ml',
    price: 1100,
    category: 'Health',
    image: 'https://loremflickr.com/400/400/pet,health?lock=1'
  },
  {
    name: 'Flea & Tick Prevention',
    description: 'Once a month topical treatment',
    price: 2150,
    category: 'Health',
    image: 'https://loremflickr.com/400/400/pet,health?lock=2'
  },
  {
    name: 'Soothing Paw Balm',
    description: 'Moisturizes rough and cracked paw pads',
    price: 950,
    category: 'Health',
    image: 'https://loremflickr.com/400/400/pet,health?lock=3'
  }
];

async function getProducts(req, res) {
  try {
    const db = await connectDB();
    const count = await db.collection('products').countDocuments();
    if (count === 0) {
      await db.collection('products').insertMany(
        SEED_PRODUCTS.map(p => ({ ...p, createdAt: new Date() }))
      );
      console.log('🌱 Database auto-seeded with initial products');
    }
    const products = await db.collection('products').find().toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
}

// ─── GROOMING ────────────────────────────────────────────────────────────────

async function bookGrooming(req, res) {
  try {
    const db = await connectDB();
    const groomingDetail = { ...req.body, createdAt: new Date() };
    const result = await db.collection('grooming').insertOne(groomingDetail);
    res.status(201).json({
      success: true,
      message: 'Grooming appointment booked successfully!',
      groomingDetail: { ...groomingDetail, _id: result.insertedId }
    });
  } catch (error) {
    console.error('bookGrooming error:', error);
    res.status(500).json({ success: false, message: 'Grooming booking failed' });
  }
}

async function getGrooming(req, res) {
  try {
    const db = await connectDB();
    const grooming = await db.collection('grooming').find().sort({ createdAt: -1 }).toArray();
    res.status(200).json(grooming);
  } catch (error) {
    console.error('getGrooming error:', error);
    res.status(500).json({ success: false, message: 'Error fetching grooming details' });
  }
}

// ─── ADMIN STATS ─────────────────────────────────────────────────────────────

async function getAdminStats(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access strictly required.' });
  }
  try {
    const db = await connectDB();
    const [bookings, orders, grooming, products, users] = await Promise.all([
      db.collection('bookings').find().sort({ createdAt: -1 }).toArray(),
      db.collection('orders').find().sort({ createdAt: -1 }).toArray(),
      db.collection('grooming').find().sort({ createdAt: -1 }).toArray(),
      db.collection('products').find().toArray(),
      db.collection('users').find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray()
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings: bookings.length,
        totalOrders: orders.length,
        totalGrooming: grooming.length,
        totalProducts: products.length,
        totalUsers: users.length,
        totalRevenue
      },
      bookings, orders, grooming, products, users
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching admin stats' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { email, password } = req.body;
    const db = await connectDB();

    const updateData = {};
    if (email) updateData.email = email.toLowerCase();
    if (password) {
      if (password.length < 6)
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0)
      return res.status(400).json({ success: false, message: 'Nothing to update.' });

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Update failed. Please try again.' });
  }
}

module.exports = {
  connectDB,
  // Auth
  register, login, verifyToken, getMe, updateProfile,
  // Bookings
  bookAppointment, getBookings,
  // Orders
  checkoutOrder, getOrders,
  // Products
  getProducts,
  // Grooming
  bookGrooming, getGrooming,
  // Admin
  getAdminStats,
  // User Personal
  getMyBookings, getMyOrders
};
