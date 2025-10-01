const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CART_FILE = path.join(__dirname, 'cart.json');

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

app.get('/cart', (req, res) => {
  res.json(readCart());
});

app.post('/cart/add', (req, res) => {
  const item = req.body;
  if (!item || !item.name) return res.status(400).json({ error: 'invalid item' });
  const cart = readCart();
  const existing = cart.find(i => i.name === item.name);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    cart.push({
      name: item.name,
      price: Number(item.price) || 0,
      image: item.image || '',
      quantity: item.quantity || 1
    });
  }
  writeCart(cart);
  res.json(cart);
});

app.post('/cart/change', (req, res) => {
  const { name, change } = req.body;
  if (!name || typeof change !== 'number') return res.status(400).json({ error: 'invalid payload' });
  const cart = readCart();
  const idx = cart.findIndex(i => i.name === name);
  if (idx === -1) return res.status(404).json({ error: 'item not found' });
  cart[idx].quantity += change;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  writeCart(cart);
  res.json(cart);
});

app.post('/cart/remove', (req, res) => {
  const { name } = req.body;
  const cart = readCart();
  const idx = cart.findIndex(i => i.name === name);
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
  // In a real app you'd process payment here. We'll just clear the cart.
  writeCart([]);
  res.json({ success: true, total });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Cart API running on http://localhost:${PORT}`));
