// Enhanced Recipe Store Application
class RecipeStoreApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.cart = [];
        this.currentUser = null;
        this.currentSection = 'home';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        this.init();
    }
    
    async init() {
        try {
            await this.checkAuthStatus();
            this.setupEventListeners();
            this.loadCart();
            await this.loadProducts();
            this.renderProducts();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }
    
    async checkAuthStatus() {
        try {
            const response = await fetch('/api/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUserUI();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
    
    updateUserUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userInfo = document.getElementById('userInfo');
        const username = document.getElementById('username');
        const ordersLink = document.getElementById('ordersLink');
        const adminLink = document.getElementById('adminLink');
        
        if (this.currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            username.textContent = this.currentUser.username;
            ordersLink.style.display = 'block';
            
            if (this.currentUser.role === 'admin') {
                adminLink.style.display = 'block';
            }
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            userInfo.style.display = 'none';
            ordersLink.style.display = 'none';
            adminLink.style.display = 'none';
        }
    }
    
    setupEventListeners() {
        // Navigation
        document.getElementById('homeLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('home');
        });
        
        document.getElementById('ordersLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('orders');
            this.loadOrders();
        });
        
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showModal('registerModal'));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Cart
        document.getElementById('cartIcon').addEventListener('click', () => this.toggleCart());
        document.getElementById('closeCart').addEventListener('click', () => this.toggleCart());
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());
        
        // Product controls
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshProducts());
        document.getElementById('searchBox').addEventListener('input', () => this.filterProducts());
        document.getElementById('sortSelect').addEventListener('change', () => this.filterProducts());
        document.getElementById('filterCuisine').addEventListener('change', () => this.filterProducts());
        document.getElementById('filterDifficulty').addEventListener('change', () => this.filterProducts());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal('productModal'));
        document.getElementById('addToCartModal').addEventListener('click', () => this.addToCartFromModal());
        
        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    showSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Show selected section
        document.getElementById(section + 'Section').classList.add('active');
        document.getElementById(section + 'Link').classList.add('active');
        
        this.currentSection = section;
    }
    
    async loadProducts() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/products');
            
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.populateFilters();
            this.showStatus('Products loaded successfully', 'success');
        } catch (error) {
            console.error('Load products failed:', error);
            this.showStatus('Failed to load products', 'error');
            this.products = [];
            this.filteredProducts = [];
        } finally {
            this.showLoading(false);
        }
    }
    
    async refreshProducts() {
        try {
            this.showLoading(true);
            this.showStatus('Fetching fresh data from API...', 'info');
            
            const response = await fetch('/api/products/refresh', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to refresh products');
            }
            
            const result = await response.json();
            await this.loadProducts();
            this.renderProducts();
            this.showToast(result.message || 'Products refreshed successfully', 'success');
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showToast('Failed to refresh products', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    populateFilters() {
        const cuisines = [...new Set(this.products.map(p => p.cuisine).filter(Boolean))];
        const cuisineSelect = document.getElementById('filterCuisine');
        
        cuisineSelect.innerHTML = '<option value=\"\">All Cuisines</option>';
        cuisines.forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineSelect.appendChild(option);
        });
    }
    
    filterProducts() {
        const search = document.getElementById('searchBox').value.toLowerCase();
        const sort = document.getElementById('sortSelect').value;
        const cuisine = document.getElementById('filterCuisine').value;
        const difficulty = document.getElementById('filterDifficulty').value;
        
        let filtered = [...this.products];
        
        // Apply filters
        if (search) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) ||
                (p.description && p.description.toLowerCase().includes(search)) ||
                (p.ingredients && p.ingredients.some(i => i.toLowerCase().includes(search)))
            );
        }
        
        if (cuisine) {
            filtered = filtered.filter(p => p.cuisine === cuisine);
        }
        
        if (difficulty) {
            filtered = filtered.filter(p => p.difficulty === difficulty);
        }
        
        // Apply sorting
        switch (sort) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating-desc':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        this.filteredProducts = filtered;
        this.currentPage = 1;
        this.renderProducts();
    }
    
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const startIdx = (this.currentPage - 1) * this.itemsPerPage;
        const endIdx = startIdx + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIdx, endIdx);
        
        if (pageProducts.length === 0) {
            grid.innerHTML = `
                <div class=\"empty-state\">
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            this.renderPagination();
            return;
        }
        
        grid.innerHTML = pageProducts.map(product => this.createProductCard(product)).join('');
        this.renderPagination();
    }
    
    createProductCard(product) {
        const totalTime = (product.prepTimeMinutes || 0) + (product.cookTimeMinutes || 0);
        
        return `
            <div class=\"product-card\" data-id=\"${product.id}\">
                <img src=\"${product.image}\" alt=\"${product.name}\" class=\"product-image\" loading=\"lazy\">
                <div class=\"product-info\">
                    <h3 class=\"product-title\">${product.name}</h3>
                    <div class=\"product-meta\">
                        <div class=\"rating\">
                            <span>⭐ ${product.rating || 0}</span>
                        </div>
                        <div class=\"price\">₹${product.price.toFixed(2)}</div>
                    </div>
                    <div class=\"product-meta\">
                        <span>${product.cuisine || 'International'}</span>
                        <span>${product.difficulty || 'Easy'}</span>
                        <span>${totalTime}min</span>
                    </div>
                    <p class=\"product-description\">${product.description || ''}</p>
                    <div class=\"product-actions\">
                        <button class=\"btn btn-primary btn-small\" onclick=\"app.addToCart('${product.id}')\">
                            Add to Cart
                        </button>
                        <button class=\"btn btn-outline btn-small\" onclick=\"app.showProductDetails('${product.id}')\">
                            Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        let html = '';
        
        // Previous button
        html += `<button ${this.currentPage === 1 ? 'disabled' : ''} onclick=\"app.goToPage(${this.currentPage - 1})\">Previous</button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage || i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `<button class=\"${i === this.currentPage ? 'active' : ''}\" onclick=\"app.goToPage(${i})\">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += '<span>...</span>';
            }
        }
        
        // Next button
        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} onclick=\"app.goToPage(${this.currentPage + 1})\">Next</button>`;
        
        pagination.innerHTML = html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showProductDetails(productId) {
        const product = this.products.find(p => p.id == productId);
        if (!product) return;
        
        document.getElementById('modalTitle').textContent = product.name;
        document.getElementById('modalImage').src = product.image;
        document.getElementById('modalRating').textContent = `⭐ ${product.rating || 0}`;
        document.getElementById('modalPrice').textContent = `₹${product.price.toFixed(2)}`;
        document.getElementById('modalCuisine').textContent = product.cuisine || 'International';
        document.getElementById('modalDifficulty').textContent = product.difficulty || 'Easy';
        
        const totalTime = (product.prepTimeMinutes || 0) + (product.cookTimeMinutes || 0);
        document.getElementById('modalTime').textContent = `${totalTime} minutes`;
        
        document.getElementById('modalDescription').textContent = product.description || '';
        
        // Ingredients
        const ingredientsList = document.getElementById('modalIngredients');
        ingredientsList.innerHTML = (product.ingredients || []).map(ing => `<li>${ing}</li>`).join('');
        
        // Instructions
        const instructionsList = document.getElementById('modalInstructions');
        instructionsList.innerHTML = (product.instructions || []).map(inst => `<li>${inst}</li>`).join('');
        
        document.getElementById('modalQuantity').value = 1;
        document.getElementById('addToCartModal').setAttribute('data-product-id', productId);
        
        this.showModal('productModal');
    }
    
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id == productId);
        if (!product) return;
        
        this.addToCartAPI(product, quantity);
    }
    
    addToCartFromModal() {
        const productId = document.getElementById('addToCartModal').getAttribute('data-product-id');
        const quantity = parseInt(document.getElementById('modalQuantity').value) || 1;
        
        this.addToCart(productId, quantity);
        this.closeModal('productModal');
    }
    
    async addToCartAPI(product, quantity) {
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }
            
            const result = await response.json();
            this.cart = result.cart;
            this.updateCartUI();
            this.showToast(`Added ${product.name} to cart`, 'success');
        } catch (error) {
            console.error('Add to cart failed:', error);
            this.showToast('Failed to add to cart', 'error');
        }
    }
    
    async loadCart() {
        try {
            const response = await fetch('/api/cart');
            if (response.ok) {
                this.cart = await response.json();
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Load cart failed:', error);
        }
    }
    
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        cartCount.textContent = this.cart.length;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class=\"empty-state\"><p>Your cart is empty</p></div>';
            cartTotal.textContent = '0.00';
            return;
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
        
        cartItems.innerHTML = this.cart.map(item => `
            <div class=\"cart-item\">
                <img src=\"${item.image}\" alt=\"${item.name}\" class=\"cart-item-image\">
                <div class=\"cart-item-info\">
                    <div class=\"cart-item-name\">${item.name}</div>
                    <div class=\"cart-item-price\">₹${item.price.toFixed(2)}</div>
                    <div class=\"quantity-controls\">
                        <button class=\"quantity-btn\" onclick=\"app.changeQuantity('${item.id}', -1)\">-</button>
                        <span>${item.quantity}</span>
                        <button class=\"quantity-btn\" onclick=\"app.changeQuantity('${item.id}', 1)\">+</button>
                        <button class=\"btn btn-danger btn-small\" onclick=\"app.removeFromCart('${item.id}')\">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async changeQuantity(productId, change) {
        try {
            const response = await fetch('/api/cart/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: productId, change })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.cart = result.cart;
                this.updateCartUI();
            }
        } catch (error) {
            console.error('Change quantity failed:', error);
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
                const result = await response.json();
                this.cart = result.cart;
                this.updateCartUI();
                this.showToast('Item removed from cart', 'success');
            }
        } catch (error) {
            console.error('Remove from cart failed:', error);
            this.showToast('Failed to remove item', 'error');
        }
    }
    
    async clearCart() {
        if (!confirm('Are you sure you want to clear your cart?')) return;
        
        try {
            const response = await fetch('/api/cart/clear', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                this.cart = [];
                this.updateCartUI();
                this.showToast('Cart cleared', 'success');
            }
        } catch (error) {
            console.error('Clear cart failed:', error);
            this.showToast('Failed to clear cart', 'error');
        }
    }
    
    async checkout() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/cart/checkout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                this.cart = [];
                this.updateCartUI();
                this.toggleCart();
                this.showToast(`Order placed successfully! Total: ₹${result.total.toFixed(2)}`, 'success');
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            this.showToast('Checkout failed', 'error');
        }
    }
    
    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        sidebar.classList.toggle('open');
    }
    
    async loadOrders() {
        if (!this.currentUser) {
            document.getElementById('ordersList').innerHTML = `
                <div class=\"empty-state\">
                    <h3>Please login to view your orders</h3>
                </div>
            `;
            return;
        }
        
        try {
            const response = await fetch('/api/orders', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const orders = await response.json();
                this.renderOrders(orders);
            }
        } catch (error) {
            console.error('Load orders failed:', error);
            this.showToast('Failed to load orders', 'error');
        }
    }
    
    renderOrders(orders) {
        const ordersList = document.getElementById('ordersList');
        
        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class=\"empty-state\">
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
                </div>
            `;
            return;
        }
        
        ordersList.innerHTML = orders.map(order => `
            <div class=\"order-card\">
                <div class=\"order-header\">
                    <div class=\"order-id\">Order #${order.id}</div>
                    <div class=\"order-date\">${new Date(order.createdAt).toLocaleDateString()}</div>
                    <div class=\"order-total\">₹${order.total.toFixed(2)}</div>
                </div>
                <div class=\"order-items\">
                    ${order.items.map(item => `
                        <div class=\"order-item\">
                            <img src=\"${item.image}\" alt=\"${item.name}\" class=\"order-item-image\">
                            <div>
                                <div>${item.name}</div>
                                <div>Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // Auth methods
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.currentUser = result.user;
                this.updateUserUI();
                this.closeModal('loginModal');
                this.showToast(`Welcome back, ${result.user.username}!`, 'success');
                document.getElementById('loginForm').reset();
            } else {
                this.showToast(result.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.showToast('Login failed', 'error');
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.currentUser = result.user;
                this.updateUserUI();
                this.closeModal('registerModal');
                this.showToast(`Welcome, ${result.user.username}!`, 'success');
                document.getElementById('registerForm').reset();
            } else {
                this.showToast(result.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            this.showToast('Registration failed', 'error');
        }
    }
    
    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                this.currentUser = null;
                this.updateUserUI();
                this.showToast('Logged out successfully', 'success');
                
                // Redirect to home if on orders page
                if (this.currentSection === 'orders') {
                    this.showSection('home');
                }
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showToast('Logout failed', 'error');
        }
    }
    
    // UI helpers
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
    
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'block' : 'none';
    }
    
    showStatus(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status-message ${type}`;
        status.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions for onclick handlers
window.switchToLogin = function() {
    app.closeModal('registerModal');
    app.showModal('loginModal');
}

window.switchToRegister = function() {
    app.closeModal('loginModal');
    app.showModal('registerModal');
}

window.closeModal = function(modalId) {
    app.closeModal(modalId);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RecipeStoreApp();
});