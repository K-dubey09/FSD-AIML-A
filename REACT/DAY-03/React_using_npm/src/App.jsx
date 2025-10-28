import React, { useState } from 'react';
import books from './data/books.json';

export default function App() {
  const [cart, setCart] = useState([]);

  function addToCart(book) {
    setCart(prev => {
      const found = prev.find(b => b.id === book.id);
      if (found) return prev.map(b => b.id === book.id ? { ...b, qty: b.qty + 1 } : b);
      return [...prev, { ...book, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(b => b.id !== id));
  }

  const itemCount = cart.reduce((s, b) => s + b.qty, 0);
  const total = cart.reduce((s, b) => s + b.qty * b.price, 0);

  return (
    <div className="app">
      <header className="header">
        <h1>Book Store</h1>
        <div className="cart-indicator">Cart: {itemCount} items</div>
      </header>

      <main className="main">
        <section className="books">
          {books.map(book => (
            <article key={book.id} className="book">
              <h3>{book.title}</h3>
              <div className="author">{book.author}</div>
              <div className="price">₹{book.price.toFixed(2)}</div>
              <button onClick={() => addToCart(book)}>Add to cart</button>
            </article>
          ))}
        </section>

        <aside className="cart-panel">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-title">{item.title} x {item.qty}</div>
                <div className="cart-price">₹{(item.price * item.qty).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            ))
          )}
          <hr />
          <div className="total">Total: ₹{total.toFixed(2)}</div>
        </aside>
      </main>
    </div>
  );
}
