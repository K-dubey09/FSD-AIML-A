const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Files we will snapshot and restore to avoid mutating the developer data during tests
const SNAP_FILES = ['users.json', 'sellers.json', 'books.json', 'orders.json', 'carts.json'];
let backupDir = null;

// Helper to read JSON store
function readJSON(name){
  const p = path.join(DATA_DIR, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p,'utf8')||'null');
}

describe('Integration RBAC flows', () => {
  let adminToken;
  let seller;
  let sellerToken;
  let bookId;
  let userToken;
  const buyerUsername = 'buyer_' + Date.now();
  const sellerUsername = 'seller_' + Date.now();

  beforeAll(() => {
    // create a small backup dir and copy files so tests can freely mutate the data folder
    backupDir = path.join(DATA_DIR, '__backup__' + Date.now());
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
    SNAP_FILES.forEach(f => {
      const src = path.join(DATA_DIR, f);
      const dest = path.join(backupDir, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
      else {
        // create an initial empty file for test purposes
        const empty = (f === 'carts.json') ? {} : [];
        fs.writeFileSync(src, JSON.stringify(empty, null, 2), 'utf8');
        fs.copyFileSync(src, dest);
      }
    });
  });

  afterAll(() => {
    // restore backups
    if (!backupDir) return;
    SNAP_FILES.forEach(f => {
      const src = path.join(backupDir, f);
      const dest = path.join(DATA_DIR, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    });
    // remove backup dir and its files
    try{
      SNAP_FILES.forEach(f => {
        const p = path.join(backupDir, f);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
      if (fs.existsSync(backupDir)) fs.rmdirSync(backupDir);
    }catch(e){ /* ignore cleanup errors */ }
  });

  test('login as admin', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    adminToken = res.body.token;
  });

  test('admin can create seller', async () => {
    const res = await request(app).post('/api/sellers').set('authorization', `Bearer ${adminToken}`).send({ username: sellerUsername, password: 'sellpass', displayName: 'Seller One' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    seller = res.body;
  });

  test('seller can login and create book', async () => {
  const login = await request(app).post('/api/auth/login').send({ username: sellerUsername, password: 'sellpass' });
    expect(login.status).toBe(200);
    sellerToken = login.body.token;

    const bookPayload = { title: 'Test Book', author: 'Test Author', price: 199, category: 'Test' };
    const create = await request(app).post('/api/books').set('authorization', `Bearer ${sellerToken}`).send(bookPayload);
    expect(create.status).toBe(200);
    expect(create.body.id).toBeTruthy();
    bookId = create.body.id;

    // verify the book exists and has sellerId
    const list = await request(app).get('/api/books');
    expect(list.status).toBe(200);
    const body = list.body;
    const items = Array.isArray(body) ? body : (body.value || []);
    const found = items.find(b => b.id === bookId);
    expect(found).toBeTruthy();
    expect(found.sellerId).toBeTruthy();
  });

  test('user can register and cart sync works', async () => {
    const r = await request(app).post('/api/auth/register').send({ username: buyerUsername, password: 'buy123' });
    expect(r.status).toBe(201);
    userToken = r.body.token;

    // put cart
    const cart = [{ id: bookId, qty: 2 }];
    const put = await request(app).put('/api/cart').set('authorization', `Bearer ${userToken}`).send(cart);
    expect(put.status).toBe(200);

    const get = await request(app).get('/api/cart').set('authorization', `Bearer ${userToken}`);
    expect(get.status).toBe(200);
    expect(Array.isArray(get.body)).toBe(true);
    expect(get.body[0].id).toBe(bookId);
  });

});
