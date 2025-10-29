import React, { useState, useEffect } from 'react';
import Book from './book';
import { loadCart, saveCart, getUser as getStoredUser, clearAuth } from './utils/storage';
import { saveOrder } from './utils/orders';
import { loadBooks } from './utils/books';
import Orders from './Orders';
import MyOrders from './MyOrders';
import Profile from './Profile';
import Settings from './Settings';
import MoreBooks from './MoreBooks';
import MoreSellers from './MoreSellers';
import MoreOrders from './MoreOrders';
import MoreUsers from './MoreUsers';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Admin from './Admin';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App(){
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [detailBook, setDetailBook] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' });
  const [orderPlacedId, setOrderPlacedId] = useState(null);
  const [view, setView] = useState('home');
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const b = await loadBooks();
        if (mounted) setBooks(b);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  function addToCart(book) {
    setCart(prev => {
      const found = prev.find(b => b.id === book.id);
      if (found) return prev.map(b => b.id === book.id ? { ...b, qty: b.qty + 1 } : b);
      return [...prev, { id: book.id, title: book.title, price: book.price, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(b => b.id === id ? { ...b, qty: Math.max(1, b.qty + delta) } : b));
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(b => b.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const itemCount = cart.reduce((s, b) => s + b.qty, 0);
  const total = cart.reduce((s, b) => s + b.qty * b.price, 0);

  useEffect(() => {
    // saveCart may be async (server sync when logged in)
    try { saveCart(cart); } catch (e) { /* ignore */ }
  }, [cart]);

  // load persisted cart (async) when app mounts
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await loadCart();
        if (mounted && Array.isArray(c)) setCart(c);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = books.filter(b => b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase()));
  const categories = Array.from(new Set(books.map(b => b.category).filter(Boolean)));
  const byCategory = category ? filtered.filter(b => b.category === category) : filtered;

  function openDetails(book) {
    setDetailBook(book);
  }

  function closeDetails() {
    setDetailBook(null);
  }

  function startCheckout() {
    setCustomer({ name: '', email: '', address: '' });
    setOrderPlacedId(null);
    setCheckoutOpen(true);
  }

  function onLogin(u){ setUser(u); navigate('/'); }

  function onLogout(){ clearAuth(); setUser(null); navigate('/'); }

  async function submitOrder(e) {
    e.preventDefault();
    if (!customer.name || !customer.address) {
      alert('Please provide name and address');
      return;
    }
    const order = {
      items: cart,
      total: total,
      customer
    };
    const id = await saveOrder(order);
    setOrderPlacedId(id);
    clearCart();
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">BS</div>
          <div>
            <div style={{fontWeight:700}}>Book Store</div>
            <div style={{fontSize:12,color:'var(--muted)'}}>A small React demo</div>
          </div>
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <nav className="nav">
            <Link to="/"><button className={view==='home'? 'active':''} onClick={() => setView('home')}>Home</button></Link>
            
            {/* Admin-only navigation */}
            {user?.role === 'admin' && (
              <>
                <Link to="/orders"><button className={view==='orders'? 'active':''} onClick={() => setView('orders')}>Orders</button></Link>
                <Link to="/admin"><button className={view==='admin'? 'active':''} onClick={() => setView('admin')}>Admin</button></Link>
                <Link to="/more-books"><button className={view==='morebooks'? 'active':''} onClick={() => setView('morebooks')}>More:Books</button></Link>
                <Link to="/more-sellers"><button className={view==='moresellers'? 'active':''} onClick={() => setView('moresellers')}>More:Sellers</button></Link>
                <Link to="/more-orders"><button className={view==='moreorders'? 'active':''} onClick={() => setView('moreorders')}>More:Orders</button></Link>
                <Link to="/more-users"><button className={view==='moreusers'? 'active':''} onClick={() => setView('moreusers')}>More:Users</button></Link>
              </>
            )}

            {/* Seller-only navigation */}
            {user?.role === 'seller' && (
              <>
                <Link to="/my-orders"><button className={view==='myorders'? 'active':''} onClick={() => setView('myorders')}>My Orders</button></Link>
              </>
            )}

            {/* Regular user navigation */}
            {user?.role === 'user' && (
              <Link to="/my-orders"><button className={view==='myorders'? 'active':''} onClick={() => setView('myorders')}>My Orders</button></Link>
            )}

            {/* Logged-in user common links */}
            {user && (
              <>
                <Link to="/profile"><button className={view==='profile'? 'active':''} onClick={() => setView('profile')}>Profile</button></Link>
                <Link to="/settings"><button className={view==='settings'? 'active':''} onClick={() => setView('settings')}>Settings</button></Link>
              </>
            )}
          </nav>

          <div className="controls">
            {user && (
              <div style={{
                display:'inline-flex',
                alignItems:'center',
                gap:6,
                padding:'6px 12px',
                background: user.role==='admin'?'linear-gradient(135deg,#ef4444,#dc2626)': user.role==='seller'?'linear-gradient(135deg,#f59e0b,#d97706)':'linear-gradient(135deg,#10b981,#059669)',
                color:'white',
                borderRadius:8,
                fontSize:12,
                fontWeight:700,
                textTransform:'uppercase',
                letterSpacing:0.5,
                boxShadow:'0 2px 8px rgba(0,0,0,0.15)'
              }}>
                {user.role === 'admin' ? '👑' : user.role === 'seller' ? '💼' : '👤'} {user.role}
              </div>
            )}
            <input aria-label="Search books" className="search" placeholder="Search by title or author" value={query} onChange={e => setQuery(e.target.value)} />
            {categories.length > 0 && (
              <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <div className="cart-indicator">Cart: {itemCount} items</div>
            {user ? (
              <button className="btn secondary" onClick={onLogout}>Logout ({user.username})</button>
            ) : (
              <Link to="/login"><button className="btn">Login</button></Link>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<Login onLogin={onLogin} />} />
        <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/login" replace />} />
  <Route path="/orders" element={user?.role === 'admin' ? <Orders /> : <Navigate to="/login" replace />} />
  <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/login" replace />} />
  <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
  <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" replace />} />
  <Route path="/more-books" element={user?.role==='admin' ? <MoreBooks /> : <Navigate to="/login" replace />} />
  <Route path="/more-sellers" element={user?.role==='admin' ? <MoreSellers /> : <Navigate to="/login" replace />} />
  <Route path="/more-orders" element={user?.role==='admin' ? <MoreOrders /> : <Navigate to="/login" replace />} />
  <Route path="/more-users" element={user?.role==='admin' ? <MoreUsers /> : <Navigate to="/login" replace />} />
        <Route path="/" element={(
          <main className="main">
            <section className="books">
              {byCategory.map(book => (
                <Book key={book.id} book={book} onAdd={() => addToCart(book)} onDetails={openDetails} />
              ))}
            </section>

            <aside className="cart-panel">
              <h2>Your Cart</h2>
              {cart.length === 0 ? (
                <p>Cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-title">{item.title}</div>
                    <div className="cart-qty">
                      <button aria-label={`Decrease ${item.title}`} onClick={() => changeQty(item.id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button aria-label={`Increase ${item.title}`} onClick={() => changeQty(item.id, 1)}>+</button>
                    </div>
                    <div className="cart-price">₹{(item.price * item.qty).toFixed(2)}</div>
                    <button className="remove" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                ))
              )}
              <hr />
              <div className="total">Total: ₹{total.toFixed(2)}</div>
              <div className="cart-actions">
                <button className="btn" onClick={startCheckout} disabled={cart.length === 0}>Checkout</button>
                <button className="btn secondary" onClick={clearCart} disabled={cart.length === 0}>Clear</button>
              </div>
            </aside>
          </main>
        )} />
      </Routes>

      {/* Details modal */}
      {detailBook && (
        <div className="modal" role="dialog" aria-modal="true" onClick={closeDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{detailBook.title}</h3>
            <div style={{display:'flex',gap:12}}>
              {detailBook.cover && <img src={detailBook.cover} alt="cover" style={{width:120,height:160,objectFit:'cover'}} />}
              <div>
                <div className="author">{detailBook.author}</div>
                <p style={{marginTop:8}}>{detailBook.description}</p>
                <div className="price">₹{detailBook.price.toFixed(2)}</div>
                <div style={{marginTop:8}}>
                  <button onClick={() => { addToCart(detailBook); closeDetails(); }}>Add to cart</button>
                  <button onClick={closeDetails} style={{marginLeft:8}}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setCheckoutOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {!orderPlacedId ? (
              <form onSubmit={submitOrder}>
                <h3>Checkout</h3>
                <p>Total amount: ₹{total.toFixed(2)}</p>
                <div style={{display:'grid',gap:8}}>
                  <input placeholder="Full name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required />
                  <input placeholder="Email (optional)" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                  <textarea placeholder="Shipping address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} required />
                </div>
                <div style={{marginTop:12,display:'flex',gap:8}}>
                  <button type="submit">Place Order</button>
                  <button type="button" onClick={() => setCheckoutOpen(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <h3>Order placed</h3>
                <p>Your order id: <strong>{orderPlacedId}</strong></p>
                <p>Thank you for your purchase!</p>
                <div style={{marginTop:8}}>
                  <button onClick={() => setCheckoutOpen(false)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
