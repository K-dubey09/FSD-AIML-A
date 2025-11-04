import React from 'react'
import './Cart.css'

const Cart = ({ items, onClose, onRemove, onChangeQty }) => {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={e=>e.stopPropagation()}>
        <div className="cart-header">
          <h3>Your cart ({items.length})</h3>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {items.map(it=> (
            <div className="cart-item" key={it.id}>
              <img src={it.image} alt={it.title} />
              <div className="ci-body">
                <div className="ci-title">{it.title}</div>
                <div className="ci-price">${(it.price*it.quantity).toFixed(2)}</div>
                <div className="ci-qty">
                  <button onClick={()=>onChangeQty(it.id, it.quantity-1)} disabled={it.quantity<=1}>−</button>
                  <span>{it.quantity}</span>
                  <button onClick={()=>onChangeQty(it.id, it.quantity+1)}>+</button>
                </div>
              </div>
              <button className="ci-remove" onClick={()=>onRemove(it.id)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-sub">Subtotal: <strong>${subtotal.toFixed(2)}</strong></div>
          <button className="btn-checkout" onClick={()=>alert('Checkout not implemented in this demo')}>Checkout</button>
        </div>
      </div>
    </div>
  )
}

export default Cart
