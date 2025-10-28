import React from 'react';

export default function Book({ book, onAdd }) {
  return (
    <article className="book">
      <h3>{book.title}</h3>
      <div className="author">{book.author}</div>
      <div className="price">₹{book.price.toFixed(2)}</div>
      <button onClick={onAdd}>Add to cart</button>
    </article>
  );
}
