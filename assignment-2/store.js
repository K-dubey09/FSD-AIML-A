// Store Application - Modern JavaScript Implementation
class RecipeStore {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.cart = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        try {
            await this.checkAuthStatus();
            await this.loadProducts();
            await this.loadCart();
            this.bindEvents();
            this.updateUI();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }

    // Authentication Methods
    async checkAuthStatus() {
        // Check if user is logged in by making a test API call
        try {
            const response = await this.apiCall('/api/cart', 'GET');
            if (response.ok) {
                // User is logged in, get user info from session
                const userResponse = await this.apiCall('/api/me', 'GET');
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    this.currentUser = userData.user;
                } else {
                    this.currentUser = { loggedIn: true };
                }
                this.updateAuthUI(true);
            }
        } catch (error) {
            console.log('Not authenticated:', error.message);
            this.updateAuthUI(false);
        }
    }

    async login(username, password) {
        try {
            this.showLoading(true);
            
            const response = await this.apiCall('/api/auth/login', 'POST', {
                username,
                password
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.updateAuthUI(true);
                this.closeModal('login-modal');
                this.showToast('Login successful!', 'success');
                await this.loadCart();
            } else {
                this.showToast(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async register(username, email, password) {
        try {
            this.showLoading(true);
            
            const response = await this.apiCall('/api/auth/register', 'POST', {
                username,
                email,
                password
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Registration successful! Please log in.', 'success');
                this.switchModal('register-modal', 'login-modal');
            } else {
                this.showToast(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showToast('Registration failed. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async logout() {
        try {
            await this.apiCall('/api/auth/logout', 'POST');
            this.currentUser = null;
            this.cart = [];
            this.updateAuthUI(false);
            this.updateCartUI();
            this.showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showToast('Logout failed', 'error');
        }
    }

    // Product Methods
    async loadProducts() {
        try {
            console.log('Loading products from API...');
            const response = await this.apiCall('/api/products', 'GET');
            if (response.ok) {
                this.products = await response.json();
                console.log('Products loaded successfully:', this.products.length, 'items');
                this.renderProducts();
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showToast('Failed to load products', 'error');
            
            // Show fallback message if no products
            const grid = document.getElementById('products-grid');
            if (grid) {
                grid.innerHTML = '<div class="error-message">Unable to load products. Please try again later.</div>';
            }
        }
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        const filteredProducts = this.currentFilter === 'all' 
            ? this.products 
            : this.products.filter(p => p.category === this.currentFilter);

        grid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Recipe'">
                    <div class="product-badge">${product.category}</div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <span><i class="fas fa-clock"></i> ${product.prepTime + product.cookTime} min</span>
                        <span><i class="fas fa-users"></i> ${product.servings} servings</span>
                        <span><i class="fas fa-star"></i> ${product.rating}</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">₹${product.price}</span>
                        <button class="add-to-cart" onclick="store.addToCart(${product.id})" title="Add to Cart">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterProducts(category) {
        this.currentFilter = category;
        this.renderProducts();
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    // Cart Methods
    async loadCart() {
        if (!this.currentUser) return;
        
        try {
            const response = await this.apiCall('/api/cart', 'GET');
            if (response.ok) {
                const cartData = await response.json();
                // App.js returns { userId: ..., items: [...] }
                this.cart = cartData.items || [];
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    }

    async addToCart(productId) {
        if (!this.currentUser) {
            this.showToast('Please log in to add items to cart', 'warning');
            this.showLoginModal();
            return;
        }

        try {
            const response = await this.apiCall('/api/cart/add', 'POST', {
                productId,
                quantity: 1
            });

            if (response.ok) {
                await this.loadCart();
                this.showToast('Item added to cart!', 'success');
            } else {
                const data = await response.json();
                this.showToast(data.error || 'Failed to add to cart', 'error');
            }
        } catch (error) {
            this.showToast('Failed to add to cart', 'error');
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await this.apiCall(`/api/cart/remove/${productId}`, 'DELETE');
            
            if (response.ok) {
                await this.loadCart();
                this.showToast('Item removed from cart', 'success');
            }
        } catch (error) {
            this.showToast('Failed to remove item', 'error');
        }
    }

    async updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.productId === productId);
        if (!item) return;

        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            await this.removeFromCart(productId);
            return;
        }

        // Remove and re-add with new quantity
        await this.removeFromCart(productId);
        
        for (let i = 0; i < newQuantity; i++) {
            await this.apiCall('/api/cart/add', 'POST', {
                productId,
                quantity: 1
            });
        }
        
        await this.loadCart();
    }

    updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        cartCount.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartTotal.textContent = '0';
            checkoutBtn.disabled = true;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="store.updateCartQuantity(${item.productId}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="store.updateCartQuantity(${item.productId}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-item" onclick="store.removeFromCart(${item.productId})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total;
            checkoutBtn.disabled = false;
        }
    }

    toggleCart() {
        const sidebar = document.getElementById('cart-sidebar');
        sidebar.classList.toggle('open');
    }

    // Order Methods
    async checkout() {
        if (!this.currentUser) {
            this.showToast('Please log in to place an order', 'warning');
            return;
        }

        if (this.cart.length === 0) {
            this.showToast('Your cart is empty', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await this.apiCall('/api/orders', 'POST');
            const data = await response.json();

            if (response.ok) {
                this.cart = [];
                this.updateCartUI();
                this.toggleCart();
                this.showToast('Order placed successfully!', 'success');
                
                // Show order confirmation
                setTimeout(() => {
                    this.showOrders();
                }, 1000);
            } else {
                this.showToast(data.error || 'Failed to place order', 'error');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            this.showToast('Failed to place order', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async showOrders() {
        if (!this.currentUser) {
            this.showToast('Please log in to view orders', 'warning');
            return;
        }

        try {
            const response = await this.apiCall('/api/orders', 'GET');
            if (response.ok) {
                const orders = await response.json();
                this.renderOrders(orders);
                this.showModal('orders-modal');
            }
        } catch (error) {
            this.showToast('Failed to load orders', 'error');
        }
    }

    renderOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<div class="empty-cart">No orders found</div>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `<div class="order-item-name">${item.name} x ${item.quantity}</div>`).join('')}
                </div>
                <div class="order-total">Total: ₹${order.total}</div>
                <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    // UI Helper Methods
    updateAuthUI(isLoggedIn) {
        const loggedOut = document.getElementById('logged-out');
        const loggedIn = document.getElementById('logged-in');
        const adminBtn = document.getElementById('admin-btn');
        const username = document.getElementById('username');

        if (isLoggedIn && this.currentUser) {
            loggedOut.style.display = 'none';
            loggedIn.style.display = 'flex';
            if (username) username.textContent = this.currentUser.username || 'User';
            
            // Show admin button if user is admin
            if (adminBtn && this.currentUser.role === 'admin') {
                adminBtn.style.display = 'block';
            }
        } else {
            loggedOut.style.display = 'flex';
            loggedIn.style.display = 'none';
            if (adminBtn) adminBtn.style.display = 'none';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    switchModal(closeId, openId) {
        this.closeModal(closeId);
        setTimeout(() => this.showModal(openId), 300);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'flex' : 'none';
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div>${message}</div>`;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    // Event Binding
    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.login(formData.get('username'), formData.get('password'));
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.register(
                formData.get('username'),
                formData.get('email'),
                formData.get('password')
            );
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterProducts(btn.dataset.category);
            });
        });

        // Modal close on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // API Helper
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for session
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(endpoint, options);
            return response;
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }
}

// Global Functions (called from HTML)
let store;

document.addEventListener('DOMContentLoaded', () => {
    store = new RecipeStore();
});

function showLoginModal() {
    store.showModal('login-modal');
}

function showRegisterModal() {
    store.showModal('register-modal');
}

function closeModal(modalId) {
    store.closeModal(modalId);
}

function switchModal(closeId, openId) {
    store.switchModal(closeId, openId);
}

function toggleCart() {
    store.toggleCart();
}

function logout() {
    store.logout();
}

function checkout() {
    store.checkout();
}

function openAdmin() {
    window.open('/admin.html', '_blank');
}

function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}