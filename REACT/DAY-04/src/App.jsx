
import { useEffect, useState } from 'react'
import './App.css'
import ProductCard from './components/ProductCard'
import Cart from './components/Cart'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    // load cart from localStorage
    const saved = localStorage.getItem('show-cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('show-cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('https://fakestoreapi.com/products')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProducts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    setCart(prev => {
      const found = prev.find(p => p.id === product.id)
      if (found) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id))
  }

  const changeQty = (id, qty) => {
    if (qty < 1) return
    setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p))
  }

  return (
    <div className="app-root container">
      <header className="site-header">
        <h1>Simple Store</h1>
        <div>
          <button className="btn-cart" onClick={() => setShowCart(true)}>
            🛒 Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </button>
        </div>
      </header>

      <main>
        {loading && <div className="loading">Loading products…</div>}
        {error && <div className="error">Error: {error}</div>}

        <section className="products-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
          ))}
        </section>
      </main>

      {showCart && (
        <Cart items={cart} onClose={() => setShowCart(false)} onRemove={removeFromCart} onChangeQty={changeQty} />
      )}
    </div>
  )
}

export default App
