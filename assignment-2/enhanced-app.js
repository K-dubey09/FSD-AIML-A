// Enhanced Store Application with Sorting and Filtering
class EnhancedRecipeStore {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.filteredProducts = [];
        this.cart = [];
        this.orders = [];
        
        // Filter states
        this.searchQuery = '';
        this.sortBy = '';
        this.cuisineFilter = '';
        this.difficultyFilter = '';
        
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
        try {
            const response = await fetch('/api/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateAuthUI(true);
            } else {
                this.updateAuthUI(false);
            }
        } catch (error) {
            console.log('Not authenticated');
            this.updateAuthUI(false);
        }
    }

    async login(username, password) {
        try {
            this.showLoading(true);
            
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.updateAuthUI(true);
                this.closeModal('loginModal');
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
            
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showToast('Registration successful! Please log in.', 'success');
                this.closeModal('registerModal');
                document.getElementById('loginBtn').click();
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
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            this.currentUser = null;
            this.cart = [];
            this.updateAuthUI(false);
            this.updateCartUI();
            this.showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Product Methods
    async loadProducts() {
        try {
            console.log('Loading products from API...');
            const response = await fetch('/api/products', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.products = await response.json();
                console.log('Products loaded:', this.products.length);
                
                // Populate cuisine filter
                this.populateCuisineFilter();
                
                // Apply filters and render
                this.applyFilters();
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showToast('Failed to load products', 'error');
        }
    }

    populateCuisineFilter() {
        const cuisines = [...new Set(this.products.map(p => p.cuisine || p.category))];
        const select = document.getElementById('filterCuisine');
        if (select) {
            select.innerHTML = '<option value="">All Cuisines</option>' +
                cuisines.map(c => `<option value="${c}">${c}</option>`).join('');
        }
    }

    applyFilters() {
        let filtered = [...this.products];

        // Apply search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        // Apply cuisine filter
        if (this.cuisineFilter) {
            filtered = filtered.filter(p => 
                (p.cuisine || p.category) === this.cuisineFilter
            );
        }

        // Apply difficulty filter
        if (this.difficultyFilter) {
            filtered = filtered.filter(p => p.difficulty === this.difficultyFilter);
        }

        // Apply sorting
        if (this.sortBy) {
            filtered = this.sortProducts(filtered);
        }

        this.filteredProducts = filtered;
        this.renderProducts();
    }

    sortProducts(products) {
        const sorted = [...products];
        
        switch (this.sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating-desc':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        return sorted;
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
            return;
        }

        grid.innerHTML = this.filteredProducts.map(product => `
            <div class="product-card" onclick="app.showProductDetails(${product.id})">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Recipe'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${(product.description || '').substring(0, 80)}...</p>
                    <div class="product-meta">
                        <span class="product-cuisine">${product.cuisine || product.category}</span>
                        <span class="product-rating">⭐ ${product.rating || 4.0}</span>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">₹${product.price}</span>
                        <button class="btn-add-cart" onclick="event.stopPropagation(); app.addToCart(${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        if (!modal) return;

        document.getElementById('modalTitle').textContent = product.name;
        document.getElementById('modalImage').src = product.image;
        document.getElementById('modalPrice').textContent = `₹${product.price}`;
        document.getElementById('modalRating').textContent = `⭐ ${product.rating || 4.0}`;
        document.getElementById('modalCuisine').textContent = product.cuisine || product.category;
        document.getElementById('modalDifficulty').textContent = product.difficulty || 'Medium';
        document.getElementById('modalTime').textContent = `${(product.prepTime || 15) + (product.cookTime || 20)} min`;
        document.getElementById('modalDescription').textContent = product.description || '';

        // Ingredients
        const ingredients = product.ingredients || [];
        document.getElementById('modalIngredients').innerHTML = 
            ingredients.map(ing => `<li>${ing}</li>`).join('');

        // Instructions
        const instructions = product.instructions || [];
        document.getElementById('modalInstructions').innerHTML = 
            instructions.map(inst => `<li>${inst}</li>`).join('');

        modal.querySelector('#addToCartModal').onclick = () => {
            const qty = parseInt(document.getElementById('modalQuantity').value);
            this.addToCart(productId, qty);
            this.closeModal('productModal');
        };

        this.showModal('productModal');
    }

    // Cart Methods
    async loadCart() {
        if (!this.currentUser) {
            this.cart = [];
            this.updateCartUI();
            return;
        }
        
        try {
            const response = await fetch('/api/cart', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.cart = await response.json();
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    }

    async addToCart(productId, quantity = 1) {
        if (!this.currentUser) {
            this.showToast('Please log in to add items to cart', 'warning');
            document.getElementById('loginBtn').click();
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showToast('Product not found', 'error');
            return;
        }

        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                })
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

    async updateCartQuantity(productId, change) {
        try {
            const response = await fetch('/api/cart/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: productId, change: change })
            });
            
            if (response.ok) {
                await this.loadCart();
            }
        } catch (error) {
            this.showToast('Failed to update quantity', 'error');
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: productId })
            });
            
            if (response.ok) {
                await this.loadCart();
                this.showToast('Item removed from cart', 'success');
            }
        } catch (error) {
            this.showToast('Failed to remove item', 'error');
        }
    }

    async clearCart() {
        if (!confirm('Clear all items from cart?')) return;
        
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                await this.loadCart();
                this.showToast('Cart cleared', 'success');
            }
        } catch (error) {
            this.showToast('Failed to clear cart', 'error');
        }
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (cartCount) cartCount.textContent = totalItems;

        if (cartItems) {
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            } else {
                cartItems.innerHTML = this.cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₹${item.price}</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="btn-qty" onclick="app.updateCartQuantity(${item.id}, -1)">-</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="btn-qty" onclick="app.updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="btn-remove" onclick="app.removeFromCart(${item.id})">×</button>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            cartTotal.textContent = totalPrice.toFixed(2);
        }
    }

    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    // Checkout
    async checkout() {
        if (!this.currentUser) {
            this.showToast('Please log in to checkout', 'warning');
            return;
        }

        if (this.cart.length === 0) {
            this.showToast('Your cart is empty', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch('/api/cart/checkout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                this.cart = [];
                this.updateCartUI();
                this.toggleCart();
                this.showToast(`Order placed successfully! Total: ₹${data.total}`, 'success');
                
                setTimeout(() => this.showOrders(), 1000);
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

    // Orders
    async loadOrders() {
        if (!this.currentUser) return;

        try {
            const response = await fetch('/api/orders', {
                credentials: 'include'
            });
            
            if (response.ok) {
                this.orders = await response.json();
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    }

    async showOrders() {
        await this.loadOrders();
        
        // Switch to orders section
        document.getElementById('homeSection').classList.remove('active');
        document.getElementById('ordersSection').classList.add('active');
        
        document.getElementById('homeLink').classList.remove('active');
        document.getElementById('ordersLink').classList.add('active');
        
        this.renderOrders();
    }

    renderOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = '<div class="no-orders">No orders yet</div>';
            return;
        }

        container.innerHTML = this.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-items">
                    ${(order.items || []).map(item => `
                        <div class="order-item">${item.name} × ${item.quantity}</div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                    <span class="order-total">₹${order.total.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }

    // UI Helper Methods
    updateAuthUI(isLoggedIn) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userInfo = document.getElementById('userInfo');
        const username = document.getElementById('username');
        const ordersLink = document.getElementById('ordersLink');
        const adminLink = document.getElementById('adminLink');

        if (isLoggedIn && this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'block';
            if (username) username.textContent = this.currentUser.username;
            if (ordersLink) ordersLink.style.display = 'block';
            
            if (adminLink && this.currentUser.role === 'admin') {
                adminLink.style.display = 'block';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
            if (ordersLink) ordersLink.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }

    showLoading(show) {
        const loading = document.getElementById('loadingSpinner');
        if (loading) loading.style.display = show ? 'flex' : 'none';
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    updateUI() {
        this.updateAuthUI(!!this.currentUser);
        this.updateCartUI();
    }

    // Event Binding
    bindEvents() {
        // Search
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.applyFilters();
            });
        }

        // Sort
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Cuisine filter
        const cuisineFilter = document.getElementById('filterCuisine');
        if (cuisineFilter) {
            cuisineFilter.addEventListener('change', (e) => {
                this.cuisineFilter = e.target.value;
                this.applyFilters();
            });
        }

        // Difficulty filter
        const difficultyFilter = document.getElementById('filterDifficulty');
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => {
                this.difficultyFilter = e.target.value;
                this.applyFilters();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadProducts());
        }

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showModal('loginModal'));
        }

        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showModal('registerModal'));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Cart icon
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Clear cart button
        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // Close cart
        const closeCart = document.getElementById('closeCart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.toggleCart());
        }

        // Navigation links
        const homeLink = document.getElementById('homeLink');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('homeSection').classList.add('active');
                document.getElementById('ordersSection').classList.remove('active');
                homeLink.classList.add('active');
                document.getElementById('ordersLink').classList.remove('active');
            });
        }

        const ordersLink = document.getElementById('ordersLink');
        if (ordersLink) {
            ordersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showOrders();
            });
        }

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;
                this.login(username, password);
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('registerUsername').value;
                const email = document.getElementById('registerEmail').value;
                const password = document.getElementById('registerPassword').value;
                this.register(username, email, password);
            });
        }

        // Close modals on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').style.display = 'none';
            });
        });
    }
}

// Global functions for HTML onclick handlers
window.switchToLogin = function() {
    app.closeModal('registerModal');
    app.showModal('loginModal');
};

window.switchToRegister = function() {
    app.closeModal('loginModal');
    app.showModal('registerModal');
};

window.closeModal = function(modalId) {
    app.closeModal(modalId);
};

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EnhancedRecipeStore();
});
