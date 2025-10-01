const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CART_FILE = path.join(__dirname, 'cart.json');
const PRICES_FILE = path.join(__dirname, 'prices.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

function readCart() {
  try {
    const data = fs.readFileSync(CART_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeCart(cart) {
  fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2));
}

function readPrices() {
  try {
    const data = fs.readFileSync(PRICES_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (e) {
    return {};
  }
}

function writePrices(prices) {
  fs.writeFileSync(PRICES_FILE, JSON.stringify(prices, null, 2));
}

function readOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

function generateRandomPrice(min = 149, max = 499) {
  const p = Math.random() * (max - min) + min;
  return Number(p.toFixed(2));
}

app.get('/cart', (req, res) => {
  res.json(readCart());
});

// Serve static files from this directory (so frontend can be loaded via http://localhost:3000)
app.use(express.static(__dirname));

// Return all saved prices
app.get('/prices', (req, res) => {
  res.json(readPrices());
});

// Return products saved locally
app.get('/products', (req, res) => {
  res.json(readProducts());
});

// Refresh products from external API and persist locally
app.post('/products/refresh', async (req, res) => {
  try {
    const fetch = require('node-fetch');
    const url = 'https://dummyjson.com/recipes';
    const resp = await fetch(url);
    if (!resp.ok) return res.status(502).json({ error: 'failed to fetch external api' });
    const data = await resp.json();
    const recipes = data.recipes || [];

    // ensure prices exist
    const prices = readPrices();
    let changed = false;
    recipes.forEach(r => {
      const key = String(r.id);
      if (prices[key] == null) {
        prices[key] = generateRandomPrice();
        changed = true;
      }
    });
    if (changed) writePrices(prices);

    // persist products (include price)
    const products = recipes.map(r => ({ id: r.id, name: r.name, image: r.image, rating: r.rating, description: r.description || '', price: prices[String(r.id)] }));
    writeProducts(products);

    res.json({ ok: true, count: products.length });
  } catch (err) {
    console.error('Refresh failed', err);
    res.status(500).json({ error: 'refresh failed' });
  }
});

// Batch endpoint: accepts { ids: [1,2,3] } and returns { "1": 199.00, ... }
app.post('/prices/batch', (req, res) => {
  const ids = req.body && req.body.ids;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids array required' });

  const prices = readPrices();
  let changed = false;

  ids.forEach(id => {
    const key = String(id);
    if (prices[key] == null) {
      prices[key] = generateRandomPrice();
      changed = true;
    }
  });

  if (changed) writePrices(prices);

  // return only requested ids mapping
  const out = {};
  ids.forEach(id => { out[String(id)] = prices[String(id)]; });
  res.json(out);
});

app.post('/cart/add', (req, res) => {
  const item = req.body;
  if (!item || (!item.id && !item.name)) return res.status(400).json({ error: 'invalid item' });
  const cart = readCart();
  // Prefer matching by id if provided
  let existing;
  if (item.id != null) {
    existing = cart.find(i => String(i.id) === String(item.id));
  }
  if (!existing && item.name) {
    existing = cart.find(i => i.name === item.name);
  }
  if (existing) {
    existing.quantity += item.quantity || 1;
    // update price/image/name if provided
    if (item.price != null) existing.price = Number(item.price);
    if (item.image != null) existing.image = item.image;
    if (item.name != null) existing.name = item.name;
    if (item.id != null) existing.id = item.id;
  } else {
    cart.push({
      id: item.id != null ? item.id : null,
      name: item.name || '',
      price: Number(item.price) || 0,
      image: item.image || '',
      quantity: item.quantity || 1
    });
  }
  writeCart(cart);
  res.json(cart);
});

app.post('/cart/change', (req, res) => {
  const { id, change } = req.body;
  if ((id == null) || typeof change !== 'number') return res.status(400).json({ error: 'invalid payload' });
  const cart = readCart();
  const idx = cart.findIndex(i => String(i.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'item not found' });
  cart[idx].quantity += change;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  writeCart(cart);
  res.json(cart);
});

app.post('/cart/remove', (req, res) => {
  const { id } = req.body;
  const cart = readCart();
  const idx = cart.findIndex(i => String(i.id) === String(id));
  if (idx !== -1) {
    cart.splice(idx, 1);
    writeCart(cart);
  }
  res.json(cart);
});

app.post('/cart/clear', (req, res) => {
  writeCart([]);
  res.json([]);
});

app.post('/cart/checkout', (req, res) => {
  const cart = readCart();
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  // Create order record
  const orders = readOrders();
  const orderId = Date.now();
  const order = {
    id: orderId,
    createdAt: new Date().toISOString(),
    items: cart,
    total
  };
  orders.push(order);
  writeOrders(orders);

  // clear cart
  writeCart([]);
  res.json({ success: true, total, orderId });
});

// Orders endpoints
app.get('/orders', (req, res) => {
  res.json(readOrders());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cart API running on http://localhost:${PORT}`));
