import React from 'react'
import './ProductCard.css'

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="card product-card">
      <div className="product-img">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-body">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-bottom">
          <div className="product-price">${product.price.toFixed(2)}</div>
          <button className="btn-add" onClick={() => onAddToCart(product)}>Add to cart</button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
