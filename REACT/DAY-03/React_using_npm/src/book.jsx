import React from 'react';

export default function Book({ book, onAdd, onDetails }) {
  return (
    <article className="book">
      {book.cover && (
        <img src={book.cover} alt={`${book.title} cover`} style={{width:120,height:160,objectFit:'cover',borderRadius:4}} />
      )}
      <h3>{book.title}</h3>
      <div className="author">{book.author}</div>
      <div className="price">₹{book.price.toFixed(2)}</div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <button onClick={onAdd}>Add to cart</button>
        <button onClick={() => onDetails && onDetails(book)} style={{background:'#eee',color:'#000',border:'1px solid #ccc'}}>Details</button>
      </div>
    </article>
  );
}
