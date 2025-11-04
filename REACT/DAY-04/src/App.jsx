import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar.js'
import Hero from './components/Hero.js'
import ProductList from './components/ProductList.js'
import ProductDetail from './components/ProductDetail.js'
import Cart from './components/Cart.js'

function App() {
  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shophub-cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shophub-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
      showNotification('✓ Quantity updated in cart!')
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
      showNotification('✓ Product added to cart!')
    }
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    
    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const handleRemoveItem = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId))
    showNotification('✓ Item removed from cart')
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShowHome = () => {
    setSelectedCategory('all')
    setSearchQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="app">
      <Navbar 
        cartCount={cartCount}
        onCategorySelect={handleCategorySelect}
        onShowCart={() => setShowCart(true)}
        onShowHome={handleShowHome}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <Hero />
      
      <ProductList 
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {showCart && (
        <Cart 
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClose={() => setShowCart(false)}
        />
      )}

      {showToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App
