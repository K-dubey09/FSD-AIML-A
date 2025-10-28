import React, { useState, useEffect } from 'react';
import books from './data/books.json';
import Book from './book';
import { loadCart, saveCart } from './utils/storage';

export default function App() {
  const [cart, setCart] = useState(() => loadCart() || []);
  const [query, setQuery] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  function addToCart(book) {
    setCart(prev => {
      const found = prev.find(b => b.id === book.id);
      if (found) return prev.map(b => b.id === book.id ? { ...b, qty: b.qty + 1 } : b);
      return [...prev, { ...book, qty: 1 }];
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
    saveCart(cart);
  }, [cart]);

  const filtered = books.filter(b => b.title.toLowerCase().includes(query.toLowerCase()) || b.author.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="app">
      <header className="header">
        <h1>Book Store</h1>
        <div className="controls">
          <input aria-label="Search books" className="search" placeholder="Search by title or author" value={query} onChange={e => setQuery(e.target.value)} />
          <div className="cart-indicator">Cart: {itemCount} items</div>
        </div>
      </header>

      <main className="main">
        <section className="books">
          {filtered.map(book => (
            <Book key={book.id} book={book} onAdd={() => addToCart(book)} />
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
            <button onClick={() => setShowCheckout(true)} disabled={cart.length===0}>Checkout</button>
            <button onClick={clearCart} disabled={cart.length===0}>Clear</button>
          </div>
        </aside>
      </main>

      {showCheckout && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h3>Checkout</h3>
            <p>Total amount: ₹{total.toFixed(2)}</p>
            <button onClick={() => { alert('Thank you for your purchase!'); clearCart(); setShowCheckout(false); }}>Confirm</button>
            <button onClick={() => setShowCheckout(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
