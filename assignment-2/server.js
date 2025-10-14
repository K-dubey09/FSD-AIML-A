const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const BackupService = require('./services/backup-service');
const APIRecoveryService = require('./services/api-recovery-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const backupService = new BackupService();
const apiRecoveryService = new APIRecoveryService();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'recipe-store-secret-2024-rbac',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
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
    return true;
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
    return false;
  }
}

// RBAC Middleware
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Auto-backup every hour
setInterval(async () => {
  try {
    await backupService.autoBackup();
    console.log('Auto-backup created successfully');
  } catch (error) {
    console.error('Auto-backup failed:', error);
  }
}, 60 * 60 * 1000); // 1 hour

// Serve static files
app.use(express.static(__dirname));

// Initialize default data if files don't exist
async function initializeData() {
  try {
    // Check if essential files exist
    const files = [PRODUCTS_FILE, USERS_FILE];
    const missingFiles = files.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.log('Initializing default data...');
      await apiRecoveryService.initializeDefaultData();
      console.log('Default data initialized successfully');
    }
    
    // Ensure admin user exists
    const users = readJsonFile(USERS_FILE, []);
    const adminExists = users.some(user => user.role === 'admin');
    
    if (!adminExists) {
      const admin = await apiRecoveryService.createDefaultAdmin();
      users.push(admin);
      writeJsonFile(USERS_FILE, users);
      console.log('Default admin created: admin/admin123');
    }
  } catch (error) {
    console.error('Data initialization failed:', error);
  }
}

// Authentication routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const users = readJsonFile(USERS_FILE, []);
    
    // Check if user already exists
    if (users.some(user => user.username === username || user.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    
    // Set session
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };
    
    res.json({
      success: true,
      user: req.session.user,
      message: 'Registration successful'
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
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const users = readJsonFile(USERS_FILE, []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    writeJsonFile(USERS_FILE, users);
    
    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    res.json({
      success: true,
      user: req.session.user,
      message: 'Login successful'
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
    res.json({ success: true, message: 'Logout successful' });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Products routes
app.get('/api/products', (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    res.json(products);
  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.post('/api/products/refresh', requireAdmin, async (req, res) => {
  try {
    console.log('Admin requested product refresh from API');
    const result = await apiRecoveryService.recoverDataFromAPI();
    res.json(result);
  } catch (error) {
    console.error('Product refresh failed:', error);
    res.status(500).json({ error: 'Failed to refresh products' });
  }
});

// Cart routes (require authentication)
app.get('/api/cart', requireAuth, (req, res) => {
  try {
    const carts = readJsonFile(CART_FILE, {});
    const userId = req.session.user.id;
    const userCart = carts[userId] || [];
    res.json(userCart);
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

app.post('/api/cart/add', requireAuth, (req, res) => {
  try {
    const { id, name, price, image, quantity = 1 } = req.body;
    const carts = readJsonFile(CART_FILE, {});
    const userId = req.session.user.id;
    
    if (!carts[userId]) {
      carts[userId] = [];
    }
    
    const existingItem = carts[userId].find(item => item.id == id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      carts[userId].push({ id, name, price, image, quantity });
    }
    
    writeJsonFile(CART_FILE, carts);
    res.json({ success: true, cart: carts[userId] });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.post('/api/cart/change', requireAuth, (req, res) => {
  try {
    const { id, change } = req.body;
    const carts = readJsonFile(CART_FILE, {});
    const userId = req.session.user.id;
    
    if (!carts[userId]) {
      carts[userId] = [];
    }
    
    const itemIndex = carts[userId].findIndex(item => item.id == id);
    if (itemIndex !== -1) {
      carts[userId][itemIndex].quantity += change;
      if (carts[userId][itemIndex].quantity <= 0) {
        carts[userId].splice(itemIndex, 1);
      }
    }
    
    writeJsonFile(CART_FILE, carts);
    res.json({ success: true, cart: carts[userId] });
  } catch (error) {
    console.error('Error changing cart quantity:', error);
    res.status(500).json({ error: 'Failed to change quantity' });
  }
});

app.post('/api/cart/remove', requireAuth, (req, res) => {
  try {
    const { id } = req.body;
    const carts = readJsonFile(CART_FILE, {});
    const userId = req.session.user.id;
    
    if (carts[userId]) {
      carts[userId] = carts[userId].filter(item => item.id != id);
      writeJsonFile(CART_FILE, carts);
    }
    
    res.json({ success: true, cart: carts[userId] || [] });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

app.post('/api/cart/clear', requireAuth, (req, res) => {
  try {
    const carts = readJsonFile(CART_FILE, {});
    const userId = req.session.user.id;
    
    carts[userId] = [];
    writeJsonFile(CART_FILE, carts);
    
    res.json({ success: true, cart: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

app.post('/api/cart/checkout', requireAuth, (req, res) => {
  try {
    const carts = readJsonFile(CART_FILE, {});
    const orders = readJsonFile(ORDERS_FILE, []);
    const userId = req.session.user.id;
    const userCart = carts[userId] || [];
    
    if (userCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    const total = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newOrder = {
      id: Date.now().toString(),
      userId,
      username: req.session.user.username,
      items: [...userCart],
      total,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeJsonFile(ORDERS_FILE, orders);
    
    // Clear user cart
    carts[userId] = [];
    writeJsonFile(CART_FILE, carts);
    
    // Update analytics
    updateAnalytics(newOrder);
    
    res.json({ success: true, order: newOrder, total });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Orders routes
app.get('/api/orders', requireAuth, (req, res) => {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    const userOrders = orders.filter(order => order.userId === req.session.user.id);
    res.json(userOrders.reverse()); // Most recent first
  } catch (error) {
    console.error('Error loading orders:', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// Admin routes (require admin role)
app.get('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    res.json(products);
  } catch (error) {
    console.error('Error loading products for admin:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const newProduct = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    writeJsonFile(PRODUCTS_FILE, products);
    
    res.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const productIndex = products.findIndex(p => p.id == req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    writeJsonFile(PRODUCTS_FILE, products);
    res.json({ success: true, product: products[productIndex] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const filteredProducts = products.filter(p => p.id != req.params.id);
    
    if (filteredProducts.length === products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    writeJsonFile(PRODUCTS_FILE, filteredProducts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    res.json(orders.reverse()); // Most recent first
  } catch (error) {
    console.error('Error loading orders for admin:', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  try {
    const users = readJsonFile(USERS_FILE, []);
    const orders = readJsonFile(ORDERS_FILE, []);
    
    // Add order statistics to each user
    const usersWithStats = users.map(user => {
      const userOrders = orders.filter(order => order.userId === user.id);
      return {
        ...user,
        password: undefined, // Don't send password
        orderCount: userOrders.length,
        totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0)
      };
    });
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Error loading users for admin:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.put('/api/admin/users/:id/toggle-role', requireAdmin, (req, res) => {
  try {
    const users = readJsonFile(USERS_FILE, []);
    const userIndex = users.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't allow changing role of the current admin
    if (users[userIndex].id === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }
    
    users[userIndex].role = users[userIndex].role === 'admin' ? 'user' : 'admin';
    writeJsonFile(USERS_FILE, users);
    
    res.json({ success: true, user: users[userIndex] });
  } catch (error) {
    console.error('Error toggling user role:', error);
    res.status(500).json({ error: 'Failed to toggle user role' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  try {
    const users = readJsonFile(USERS_FILE, []);
    
    // Don't allow deleting yourself
    if (req.params.id === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    const filteredUsers = users.filter(u => u.id !== req.params.id);
    
    if (filteredUsers.length === users.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    writeJsonFile(USERS_FILE, filteredUsers);
    
    // Also remove user's orders and cart
    const orders = readJsonFile(ORDERS_FILE, []);
    const filteredOrders = orders.filter(o => o.userId !== req.params.id);
    writeJsonFile(ORDERS_FILE, filteredOrders);
    
    const carts = readJsonFile(CART_FILE, {});
    delete carts[req.params.id];
    writeJsonFile(CART_FILE, carts);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    const filteredOrders = orders.filter(o => o.id !== req.params.id);
    
    if (filteredOrders.length === orders.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    writeJsonFile(ORDERS_FILE, filteredOrders);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Analytics route
app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  try {
    const analytics = readJsonFile(ANALYTICS_FILE, {});
    const orders = readJsonFile(ORDERS_FILE, []);
    const users = readJsonFile(USERS_FILE, []);
    const products = readJsonFile(PRODUCTS_FILE, []);
    
    // Calculate real-time analytics from orders
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = orders.filter(order => new Date(order.createdAt) >= sevenDaysAgo);
    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Calculate top customers
    const customerStats = {};
    orders.forEach(order => {
      if (order.userId) {
        if (!customerStats[order.userId]) {
          customerStats[order.userId] = {
            username: order.username || 'Unknown',
            totalOrders: 0,
            totalSpent: 0
          };
        }
        customerStats[order.userId].totalOrders += 1;
        customerStats[order.userId].totalSpent += order.total || 0;
      }
    });
    
    const topCustomers = Object.entries(customerStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    // Calculate product popularity
    const productPopularity = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productPopularity[item.id]) {
          productPopularity[item.id] = {
            name: item.name,
            totalSold: 0,
            totalRevenue: 0
          };
        }
        productPopularity[item.id].totalSold += item.quantity || 1;
        productPopularity[item.id].totalRevenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    
    const topProducts = Object.entries(productPopularity)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
    
    // Calculate monthly trends (last 6 months)
    const monthlyTrends = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      monthlyTrends[monthKey] = { revenue: 0, orders: 0 };
    }
    
    orders.forEach(order => {
      const orderMonth = order.createdAt?.slice(0, 7);
      if (monthlyTrends[orderMonth]) {
        monthlyTrends[orderMonth].revenue += order.total || 0;
        monthlyTrends[orderMonth].orders += 1;
      }
    });
    
    // Calculate growth rates
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthKey = lastMonth.toISOString().slice(0, 7);
    
    const currentMonthData = monthlyTrends[currentMonth] || { revenue: 0, orders: 0 };
    const lastMonthData = monthlyTrends[lastMonthKey] || { revenue: 0, orders: 0 };
    
    const revenueGrowth = lastMonthData.revenue > 0 
      ? ((currentMonthData.revenue - lastMonthData.revenue) / lastMonthData.revenue) * 100 
      : 0;
    
    const orderGrowth = lastMonthData.orders > 0 
      ? ((currentMonthData.orders - lastMonthData.orders) / lastMonthData.orders) * 100 
      : 0;
    
    const enhancedAnalytics = {
      ...analytics,
      totalRevenue,
      totalOrders,
      totalUsers: users.length,
      totalProducts: products.length,
      averageOrderValue,
      recentRevenue,
      recentOrders: recentOrders.length,
      topCustomers,
      topProducts,
      monthlyTrends: Object.entries(monthlyTrends)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data })),
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      orderGrowth: Math.round(orderGrowth * 100) / 100,
      activeUsers: users.filter(user => user.lastLogin).length,
      conversionRate: users.length > 0 ? (totalOrders / users.length) * 100 : 0,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(enhancedAnalytics);
  } catch (error) {
    console.error('Error loading analytics:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// Backup management routes
app.get('/api/admin/backups', requireAdmin, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

app.post('/api/admin/backup/create', requireAdmin, async (req, res) => {
  try {
    const result = await backupService.createBackup('manual');
    res.json({
      success: true,
      message: 'Backup created successfully',
      backup: result
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

app.post('/api/admin/backup/restore', requireAdmin, async (req, res) => {
  try {
    const { backupPath } = req.body;
    const result = await backupService.restoreFromBackup(backupPath);
    res.json(result);
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

app.delete('/api/admin/backup/:id', requireAdmin, async (req, res) => {
  try {
    const result = await backupService.deleteBackup(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Data recovery routes
app.post('/api/admin/recover-from-api', requireAdmin, async (req, res) => {
  try {
    const result = await apiRecoveryService.recoverDataFromAPI();
    res.json(result);
  } catch (error) {
    console.error('Error recovering from API:', error);
    res.status(500).json({ error: 'Failed to recover data from API' });
  }
});

app.get('/api/admin/validate-data', requireAdmin, async (req, res) => {
  try {
    const result = await backupService.validateDataFiles();
    res.json(result);
  } catch (error) {
    console.error('Error validating data:', error);
    res.status(500).json({ error: 'Failed to validate data' });
  }
});

// Export routes (admin only)
app.get('/api/admin/export/products', requireAdmin, async (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, 'temp-products.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'price', title: 'Price' },
        { id: 'cuisine', title: 'Cuisine' },
        { id: 'difficulty', title: 'Difficulty' },
        { id: 'rating', title: 'Rating' }
      ]
    });
    
    await csvWriter.writeRecords(products);
    res.download(path.join(__dirname, 'temp-products.csv'), 'products.csv', (err) => {
      if (!err) {
        // Clean up temp file
        fs.unlink(path.join(__dirname, 'temp-products.csv'), () => {});
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.get('/api/admin/export/orders', requireAdmin, async (req, res) => {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, 'temp-orders.csv'),
      header: [
        { id: 'id', title: 'Order ID' },
        { id: 'username', title: 'Customer' },
        { id: 'total', title: 'Total' },
        { id: 'createdAt', title: 'Date' }
      ]
    });
    
    await csvWriter.writeRecords(orders);
    res.download(path.join(__dirname, 'temp-orders.csv'), 'orders.csv', (err) => {
      if (!err) {
        fs.unlink(path.join(__dirname, 'temp-orders.csv'), () => {});
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.get('/api/admin/export/users', requireAdmin, async (req, res) => {
  try {
    const users = readJsonFile(USERS_FILE, []);
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, 'temp-users.csv'),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'username', title: 'Username' },
        { id: 'email', title: 'Email' },
        { id: 'role', title: 'Role' },
        { id: 'createdAt', title: 'Created' }
      ]
    });
    
    await csvWriter.writeRecords(safeUsers);
    res.download(path.join(__dirname, 'temp-users.csv'), 'users.csv', (err) => {
      if (!err) {
        fs.unlink(path.join(__dirname, 'temp-users.csv'), () => {});
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.get('/api/admin/export/all', requireAdmin, async (req, res) => {
  try {
    const products = readJsonFile(PRODUCTS_FILE, []);
    const orders = readJsonFile(ORDERS_FILE, []);
    const users = readJsonFile(USERS_FILE, []).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
    
    const allData = [
      ...products.map(p => ({ type: 'product', ...p })),
      ...orders.map(o => ({ type: 'order', ...o })),
      ...users.map(u => ({ type: 'user', ...u }))
    ];
    
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, 'temp-all-data.csv'),
      header: [
        { id: 'type', title: 'Type' },
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name/Username' },
        { id: 'createdAt', title: 'Created' }
      ]
    });
    
    await csvWriter.writeRecords(allData);
    res.download(path.join(__dirname, 'temp-all-data.csv'), 'all-data.csv', (err) => {
      if (!err) {
        fs.unlink(path.join(__dirname, 'temp-all-data.csv'), () => {});
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Analytics update function
function updateAnalytics(newOrder) {
  try {
    const analytics = readJsonFile(ANALYTICS_FILE, {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: [],
      monthlyRevenue: {},
      dailyStats: {},
      productStats: {},
      customerStats: {},
      revenueGrowth: 0,
      orderGrowth: 0,
      lastUpdated: new Date().toISOString()
    });
    
    // Update basic metrics
    analytics.totalRevenue += newOrder.total;
    analytics.totalOrders += 1;
    analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
    analytics.lastUpdated = new Date().toISOString();
    
    // Update monthly revenue
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    if (!analytics.monthlyRevenue) {
      analytics.monthlyRevenue = {};
    }
    analytics.monthlyRevenue[month] = (analytics.monthlyRevenue[month] || 0) + newOrder.total;
    
    // Update daily stats
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (!analytics.dailyStats) {
      analytics.dailyStats = {};
    }
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = { orders: 0, revenue: 0, items: 0 };
    }
    analytics.dailyStats[today].orders += 1;
    analytics.dailyStats[today].revenue += newOrder.total;
    analytics.dailyStats[today].items += newOrder.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update product statistics
    if (!analytics.productStats) {
      analytics.productStats = {};
    }
    newOrder.items.forEach(item => {
      if (!analytics.productStats[item.id]) {
        analytics.productStats[item.id] = {
          name: item.name,
          totalSold: 0,
          totalRevenue: 0,
          averagePrice: 0
        };
      }
      analytics.productStats[item.id].totalSold += item.quantity;
      analytics.productStats[item.id].totalRevenue += item.price * item.quantity;
      analytics.productStats[item.id].averagePrice = analytics.productStats[item.id].totalRevenue / analytics.productStats[item.id].totalSold;
    });
    
    // Update customer statistics
    if (!analytics.customerStats) {
      analytics.customerStats = {};
    }
    if (newOrder.userId) {
      if (!analytics.customerStats[newOrder.userId]) {
        analytics.customerStats[newOrder.userId] = {
          username: newOrder.username || 'Unknown',
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          lastOrderDate: null
        };
      }
      analytics.customerStats[newOrder.userId].totalOrders += 1;
      analytics.customerStats[newOrder.userId].totalSpent += newOrder.total;
      analytics.customerStats[newOrder.userId].averageOrderValue = analytics.customerStats[newOrder.userId].totalSpent / analytics.customerStats[newOrder.userId].totalOrders;
      analytics.customerStats[newOrder.userId].lastOrderDate = newOrder.createdAt;
    }
    
    // Calculate growth rates (comparing with previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthKey = lastMonth.toISOString().slice(0, 7);
    
    if (analytics.monthlyRevenue[lastMonthKey]) {
      analytics.revenueGrowth = ((analytics.monthlyRevenue[month] - analytics.monthlyRevenue[lastMonthKey]) / analytics.monthlyRevenue[lastMonthKey]) * 100;
    }
    
    // Update top products (sort by total sold)
    analytics.topProducts = Object.entries(analytics.productStats)
      .map(([id, stats]) => ({ id, name: stats.name, totalSold: stats.totalSold, revenue: stats.totalRevenue }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
    
    writeJsonFile(ANALYTICS_FILE, analytics);
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Enhanced Recipe Store API running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`🏪 Store Front: http://localhost:${PORT}/index-enhanced.html`);
  console.log(`🔐 RBAC Enabled - Admin access required for admin panel`);
  
  await initializeData();
  
  // Create initial backup
  try {
    await backupService.createBackup('startup');
    console.log('✅ Startup backup created');
  } catch (error) {
    console.warn('⚠️ Startup backup failed:', error.message);
  }
});

module.exports = app;