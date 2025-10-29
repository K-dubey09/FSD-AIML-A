const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Users persistence (simple JSON file). For production use a database.
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function loadUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

async function saveUsers(list) {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

const SELLERS_FILE = path.join(DATA_DIR, 'sellers.json');

async function loadSellers() {
  try {
    const raw = await fs.readFile(SELLERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

async function saveSellers(list) {
  try {
    await fs.writeFile(SELLERS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// Ensure a default admin user exists (dev convenience)
(async function ensureAdmin(){
  try{
    const users = await loadUsers();
    if (!users.find(u => u.role === 'admin')){
      const id = Date.now();
      const plain = 'admin';
      const passwordHash = bcrypt.hashSync(plain, 8);
      users.push({ id, username: 'admin', password: plain, passwordHash, role: 'admin', displayName: 'Administrator' });
      await saveUsers(users);
      console.log('Created default admin: admin/admin');
    }
  }catch(e){ /* ignore */ }
})();

const CARTS_FILE = path.join(DATA_DIR, 'carts.json');

async function loadCarts() {
  try {
    const raw = await fs.readFile(CARTS_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

async function saveCarts(obj) {
  try {
    await fs.writeFile(CARTS_FILE, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

function readJSON(filename){
  const p = path.join(DATA_DIR, filename);
  return fs.readFile(p, 'utf8').then(JSON.parse).catch(() => []);
}

function writeJSON(filename, data){
  const p = path.join(DATA_DIR, filename);
  return fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

function generateToken(user){
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing authorization' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'invalid authorization' });
  const token = parts[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch(e){
    return res.status(401).json({ error: 'invalid token' });
  }
}

function requireAdmin(req, res, next){
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'admin only' });
  next();
}

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = await loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  // Authenticate: prefer passwordHash (bcrypt). If not present, allow a stored plaintext `password` field.
  if (user.passwordHash) {
    if (!bcrypt.compareSync(password, user.passwordHash)) return res.status(401).json({ error: 'invalid credentials' });
  } else if (user.password) {
    // stored plaintext password (insecure) — explicit acceptance if present in data file
    if (password !== user.password) return res.status(401).json({ error: 'invalid credentials' });
  } else {
    // no credential stored — reject (do not accept implicit admin/admin)
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Registration
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = await loadUsers();
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'username taken' });
  const id = Date.now();
  const passwordHash = bcrypt.hashSync(password, 8);
  const user = { id, username, password, passwordHash, role: 'user' };
  users.push(user);
  await saveUsers(users);
  const token = generateToken(user);
  res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// Get current authenticated user profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const users = await loadUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'not found' });
  const { passwordHash, password, ...safe } = user;
  res.json(safe);
});

// Admin: create seller user and seller profile
app.post('/api/sellers', authMiddleware, requireAdmin, async (req, res) => {
  const { username, password, displayName } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = await loadUsers();
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'username taken' });
  const id = Date.now();
  const passwordHash = bcrypt.hashSync(password, 8);
  const user = { id, username, password, passwordHash, role: 'seller' };
  users.push(user);
  await saveUsers(users);

  const sellers = await loadSellers();
  const seller = { id: user.id, userId: user.id, displayName: displayName || username, createdAt: new Date().toISOString() };
  sellers.push(seller);
  await saveSellers(sellers);
  res.status(201).json(seller);
});

// Admin: list sellers
app.get('/api/sellers', authMiddleware, requireAdmin, async (req, res) => {
  const sellers = await loadSellers();
  res.json(sellers);
});

// Admin: list users (sanitized)
app.get('/api/users', authMiddleware, requireAdmin, async (req, res) => {
  const users = await loadUsers();
  const safe = users.map(u => ({ id: u.id, username: u.username, role: u.role, displayName: u.displayName }));
  res.json(safe);
});

// Update user profile (self or admin)
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { password, displayName } = req.body || {};
  const users = await loadUsers();
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'not found' });
  // only admin or owner
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ error: 'forbidden' });
  if (displayName !== undefined) user.displayName = displayName;
  if (password) {
    user.passwordHash = bcrypt.hashSync(password, 8);
    user.password = password; // keep plaintext for demo/visibility per repo convention
  }
  await saveUsers(users);
  const { passwordHash, password: _pw, ...safe } = user;
  res.json(safe);
});

// Admin: update seller profile
app.put('/api/sellers/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const sellers = await loadSellers();
  const updated = sellers.map(s => s.id === id ? { ...s, ...req.body } : s);
  await saveSellers(updated);
  res.json({ ok: true });
});

// Admin: delete seller (and optionally their products)
app.delete('/api/sellers/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const sellers = await loadSellers();
  const remaining = sellers.filter(s => s.id !== id);
  await saveSellers(remaining);
  // optionally remove products
  const books = await readJSON('books.json');
  const remainingBooks = books.filter(b => b.sellerId !== id);
  await writeJSON('books.json', remainingBooks);
  res.json({ ok: true });
});

// Books CRUD
app.get('/api/books', async (req, res) => {
  // support optional query params: q, category, sellerId, page, limit
  const q = (req.query.q || '').toLowerCase();
  const category = req.query.category;
  const sellerId = req.query.sellerId ? Number(req.query.sellerId) : undefined;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));

  let books = await readJSON('books.json');
  if (q) books = books.filter(b => (b.title||'').toLowerCase().includes(q) || (b.author||'').toLowerCase().includes(q) || (b.description||'').toLowerCase().includes(q));
  if (category) books = books.filter(b => b.category === category);
  if (sellerId) books = books.filter(b => b.sellerId === sellerId);

  const start = (page - 1) * limit;
  const pageItems = books.slice(start, start + limit);
  res.json({ value: pageItems, count: books.length, page, limit });
});

app.post('/api/books', authMiddleware, async (req, res) => {
  const b = req.body;
  const list = await readJSON('books.json');
  const id = Date.now();
  // if seller creating book, set sellerId; admin may provide sellerId in body
  const sellerId = (req.user.role === 'seller') ? req.user.id : (b.sellerId || undefined);
  const book = { id, ...b, sellerId };
  list.push(book);
  await writeJSON('books.json', list);
  res.json(book);
});

app.put('/api/books/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const patch = req.body;
  const list = await readJSON('books.json');
  const book = list.find(x => x.id === id);
  if (!book) return res.status(404).json({ error: 'not found' });
  // only admin or seller owner can update
  if (req.user.role !== 'admin' && !(req.user.role === 'seller' && book.sellerId === req.user.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const updated = list.map(x => x.id === id ? { ...x, ...patch } : x);
  await writeJSON('books.json', updated);
  res.json({ ok: true });
});

app.delete('/api/books/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const list = await readJSON('books.json');
  const book = list.find(x => x.id === id);
  if (!book) return res.status(404).json({ error: 'not found' });
  if (req.user.role !== 'admin' && !(req.user.role === 'seller' && book.sellerId === req.user.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const updated = list.filter(x => x.id !== id);
  await writeJSON('books.json', updated);
  res.json({ ok: true });
});

// Orders
app.get('/api/orders', authMiddleware, requireAdmin, async (req, res) => {
  const orders = await readJSON('orders.json');
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const payload = req.body;
  if (!payload || !payload.items || !Array.isArray(payload.items)) return res.status(400).json({ error: 'invalid order' });
  const orders = await readJSON('orders.json');
  const id = Date.now();
  // attach user if token provided
  let user = null;
  try{
    const auth = req.headers.authorization;
    if (auth){
      const token = auth.split(' ')[1];
      user = jwt.verify(token, JWT_SECRET);
    }
  }catch(e){ user = null; }
  // attach sellerId to each item from books catalog and init status
  const books = await readJSON('books.json');
  const itemsWithSeller = payload.items.map(it => {
    const book = books.find(b => b.id === it.id) || {};
    return { ...it, sellerId: book.sellerId };
  });

  const order = { id, ...payload, items: itemsWithSeller, status: 'placed', tracking: 'pending', createdAt: new Date().toISOString(), user: user ? { id: user.id, username: user.username } : undefined };
  orders.push(order);
  await writeJSON('orders.json', orders);
  res.json({ id });
});

// Update order status - admin or seller for their items
app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status, tracking } = req.body || {};
  const orders = await readJSON('orders.json');
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'not found' });

  // seller can update only if at least one item belongs to them
  if (req.user.role === 'seller') {
    const sellerItems = order.items.filter(it => it.sellerId === req.user.id);
    if (sellerItems.length === 0) return res.status(403).json({ error: 'forbidden' });
  }

  if (status) order.status = status;
  if (tracking) order.tracking = tracking;
  await writeJSON('orders.json', orders);
  res.json({ ok: true });
});

// Seller: list orders that include their products
app.get('/api/seller/orders', authMiddleware, async (req, res) => {
  if (req.user.role !== 'seller') return res.status(403).json({ error: 'seller only' });
  const orders = await readJSON('orders.json');
  const mine = orders.filter(o => o.items.some(it => it.sellerId === req.user.id));
  res.json(mine);
});

// My orders - returns orders for authenticated user
app.get('/api/my-orders', authMiddleware, async (req, res) => {
  const orders = await readJSON('orders.json');
  const mine = orders.filter(o => (o.user && o.user.username === req.user.username) || (o.customer && (o.customer.email === req.user.username || o.customer.name === req.user.username)));
  res.json(mine);
});

// Get current user's cart (per-user)
app.get('/api/cart', authMiddleware, async (req, res) => {
  const carts = await loadCarts();
  const cart = carts[req.user.id] || [];
  res.json(cart);
});

// Replace current user's cart
app.put('/api/cart', authMiddleware, async (req, res) => {
  const payload = req.body;
  if (!Array.isArray(payload)) return res.status(400).json({ error: 'invalid cart' });
  const carts = await loadCarts();
  carts[req.user.id] = payload;
  await saveCarts(carts);
  res.json({ ok: true });
});
// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

module.exports = app;
