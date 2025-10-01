const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'recipe-store-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// File paths
const DATA_DIR = __dirname;
const CART_FILE = path.join(DATA_DIR, 'cart.json');
const PRICES_FILE = path.join(DATA_DIR, 'prices.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

// Utility functions for file operations
function readJsonFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      writeJsonFile(filePath, defaultValue);
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || JSON.stringify(defaultValue));
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
  }
}

// Data access functions
const readCart = () => readJsonFile(CART_FILE, []);
const writeCart = (cart) => writeJsonFile(CART_FILE, cart);
const readPrices = () => readJsonFile(PRICES_FILE, {});
const writePrices = (prices) => writeJsonFile(PRICES_FILE, prices);
const readOrders = () => readJsonFile(ORDERS_FILE, []);
const writeOrders = (orders) => writeJsonFile(ORDERS_FILE, orders);
const readProducts = () => readJsonFile(PRODUCTS_FILE, []);
const writeProducts = (products) => writeJsonFile(PRODUCTS_FILE, products);
const readUsers = () => readJsonFile(USERS_FILE, []);
const writeUsers = (users) => writeJsonFile(USERS_FILE, users);
const readAnalytics = () => readJsonFile(ANALYTICS_FILE, { views: 0, orders: 0, revenue: 0, topProducts: [] });
const writeAnalytics = (analytics) => writeJsonFile(ANALYTICS_FILE, analytics);

// Utility functions
function generateRandomPrice(min = 149, max = 499) {
  const p = Math.random() * (max - min) + min;
  return Number(p.toFixed(2));
}

function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const users = readUsers();
  const user = users.find(u => u.id === req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  req.user = user;
  next();
}

// Initialize default admin user
function initializeDefaultAdmin() {
  const users = readUsers();
  const adminExists = users.some(u => u.role === 'admin');
  
  if (!adminExists) {
    const defaultAdmin = {
      id: generateId(),
      username: 'admin',
      email: 'admin@recipestore.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    users.push(defaultAdmin);
    writeUsers(users);
    console.log('Default admin created: admin/admin123');
  }
}

// Analytics tracking
function trackAnalytics(type, data = {}) {
  const analytics = readAnalytics();
  
  switch (type) {
    case 'view':
      analytics.views += 1;
      break;
    case 'order':
      analytics.orders += 1;
      analytics.revenue += data.total || 0;
      break;
    case 'product':
      const existing = analytics.topProducts.find(p => p.id === data.id);
      if (existing) {
        existing.count += 1;
      } else {
        analytics.topProducts.push({ id: data.id, name: data.name, count: 1 });
      }
      analytics.topProducts.sort((a, b) => b.count - a.count);
      analytics.topProducts = analytics.topProducts.slice(0, 10);
      break;
  }
  
  writeAnalytics(analytics);
}

// API Routes

// Serve static files
app.use(express.static(__dirname));

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    const users = readUsers();
    
    // Check if user exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: generateId(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeUsers(users);
    
    // Auto login
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.role = newUser.role;
    
    res.json({ 
      success: true, 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const users = readUsers();
    const user = users.find(u => u.username === username || u.email === username);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const users = readUsers();
  const user = users.find(u => u.id === req.session.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ 
    user: { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    } 
  });
});

// Products routes
app.get('/api/products', (req, res) => {
  trackAnalytics('view');
  const products = readProducts();
  res.json(products);
});

app.post('/api/products/refresh', async (req, res) => {
  try {
    console.log('Fetching products from external API...');
    const url = 'https://dummyjson.com/recipes';
    const resp = await fetch(url);
    
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    }
    
    const data = await resp.json();
    const recipes = data.recipes || [];
    console.log(`Fetched ${recipes.length} recipes`);

    // Ensure prices exist
    const prices = readPrices();
    let pricesChanged = false;
    
    recipes.forEach(r => {
      const key = String(r.id);
      if (prices[key] == null) {
        prices[key] = generateRandomPrice();
        pricesChanged = true;
      }
    });
    
    if (pricesChanged) {
      writePrices(prices);
      console.log('Updated prices for new products');
    }

    // Create enhanced products with all recipe data
    const products = recipes.map(r => ({
      id: r.id,
      name: r.name,
      image: r.image,
      rating: r.rating || 0,
      description: r.description || '',
      price: prices[String(r.id)],
      ingredients: r.ingredients || [],
      instructions: r.instructions || [],
      prepTimeMinutes: r.prepTimeMinutes || 0,
      cookTimeMinutes: r.cookTimeMinutes || 0,
      servings: r.servings || 1,
      difficulty: r.difficulty || 'Easy',
      cuisine: r.cuisine || 'International',
      caloriesPerServing: r.caloriesPerServing || 0,
      tags: r.tags || [],
      mealType: r.mealType || []
    }));
    
    writeProducts(products);
    console.log(`Saved ${products.length} products to local file`);

    res.json({ 
      success: true, 
      count: products.length,
      message: `Successfully fetched and saved ${products.length} products`
    });
  } catch (err) {
    console.error('Refresh failed:', err);
    res.status(500).json({ 
      error: 'Failed to refresh products', 
      details: err.message 
    });
  }
});

// Cart routes
app.get('/api/cart', (req, res) => {
  const cart = readCart();
  res.json(cart);
});

app.post('/api/cart/add', (req, res) => {
  try {
    const item = req.body;
    if (!item || (!item.id && !item.name)) {
      return res.status(400).json({ error: 'Invalid item' });
    }
    
    const cart = readCart();
    let existing = cart.find(i => String(i.id) === String(item.id));
    
    if (existing) {
      existing.quantity += item.quantity || 1;
      if (item.price != null) existing.price = Number(item.price);
      if (item.image != null) existing.image = item.image;
      if (item.name != null) existing.name = item.name;
    } else {
      cart.push({
        id: item.id,
        name: item.name || '',
        price: Number(item.price) || 0,
        image: item.image || '',
        quantity: item.quantity || 1
      });
    }
    
    writeCart(cart);
    trackAnalytics('product', { id: item.id, name: item.name });
    
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.post('/api/cart/change', (req, res) => {
  try {
    const { id, change } = req.body;
    if (id == null || typeof change !== 'number') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    
    const cart = readCart();
    const idx = cart.findIndex(i => String(i.id) === String(id));
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    cart[idx].quantity += change;
    if (cart[idx].quantity <= 0) {
      cart.splice(idx, 1);
    }
    
    writeCart(cart);
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Change cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

app.post('/api/cart/remove', (req, res) => {
  try {
    const { id } = req.body;
    const cart = readCart();
    const idx = cart.findIndex(i => String(i.id) === String(id));
    
    if (idx !== -1) {
      cart.splice(idx, 1);
      writeCart(cart);
    }
    
    res.json({ success: true, cart });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

app.post('/api/cart/clear', (req, res) => {
  try {
    writeCart([]);
    res.json({ success: true, cart: [] });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

app.post('/api/cart/checkout', (req, res) => {
  try {
    const cart = readCart();
    
    if (cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderId = generateId();
    
    const order = {
      id: orderId,
      userId: req.session.userId || null,
      createdAt: new Date().toISOString(),
      items: cart,
      total,
      status: 'pending'
    };
    
    const orders = readOrders();
    orders.push(order);
    writeOrders(orders);
    
    // Clear cart
    writeCart([]);
    
    // Track analytics
    trackAnalytics('order', { total });
    
    res.json({ 
      success: true, 
      orderId, 
      total,
      message: 'Order placed successfully' 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Orders routes
app.get('/api/orders', requireAuth, (req, res) => {
  try {
    const orders = readOrders();
    const userOrders = orders.filter(o => o.userId === req.session.userId);
    res.json(userOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin routes
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  try {
    const analytics = readAnalytics();
    const orders = readOrders();
    const products = readProducts();
    const users = readUsers();
    
    const dashboard = {
      stats: {
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        views: analytics.views
      },
      recentOrders: orders.slice(-10).reverse(),
      topProducts: analytics.topProducts || [],
      salesData: generateSalesData(orders)
    };
    
    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const orders = readOrders();
    res.json(orders);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = readUsers();
    const safeUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const product = req.body;
    const products = readProducts();
    
    product.id = generateId();
    product.createdAt = new Date().toISOString();
    
    products.push(product);
    writeProducts(products);
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const products = readProducts();
    
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
    writeProducts(products);
    
    res.json({ success: true, product: products[idx] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const products = readProducts();
    
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    products.splice(idx, 1);
    writeProducts(products);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Export routes
app.get('/api/admin/export/orders', requireAdmin, (req, res) => {
  try {
    const orders = readOrders();
    const csvPath = path.join(__dirname, 'exports', 'orders.csv');
    
    // Ensure exports directory exists
    const exportsDir = path.dirname(csvPath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    const csvWriter = createCsvWriter({
      path: csvPath,
      header: [
        { id: 'id', title: 'Order ID' },
        { id: 'createdAt', title: 'Date' },
        { id: 'total', title: 'Total' },
        { id: 'itemCount', title: 'Items' },
        { id: 'status', title: 'Status' }
      ]
    });
    
    const records = orders.map(order => ({
      id: order.id,
      createdAt: order.createdAt,
      total: order.total,
      itemCount: order.items.length,
      status: order.status || 'completed'
    }));
    
    csvWriter.writeRecords(records)
      .then(() => {
        res.download(csvPath, 'orders.csv');
      })
      .catch(err => {
        console.error('CSV export error:', err);
        res.status(500).json({ error: 'Export failed' });
      });
  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({ error: 'Failed to export orders' });
  }
});

// Helper functions
function generateSalesData(orders) {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOrders = orders.filter(order => 
      order.createdAt.startsWith(dateStr)
    );
    
    last7Days.push({
      date: dateStr,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
    });
  }
  
  return last7Days;
}

// Initialize
initializeDefaultAdmin();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Enhanced Recipe Store API running on http://localhost:${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`Default Admin: admin / admin123`);
});