// Admin Panel Application
class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.products = [];
        this.orders = [];
        this.users = [];
        this.analytics = {};
        
        this.init();
    }
    
    async init() {
        try {
            await this.checkAdminAuth();
            this.setupEventListeners();
            await this.loadDashboardData();
        } catch (error) {
            console.error('Admin panel initialization failed:', error);
            this.showToast('Failed to initialize admin panel', 'error');
            // Redirect to main store if not authorized
            window.location.href = 'index-enhanced.html';
        }
    }
    
    async checkAdminAuth() {
        try {
            const response = await fetch('/api/me', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Not authenticated');
            }
            
            const data = await response.json();
            if (data.user.role !== 'admin') {
                throw new Error('Not authorized as admin');
            }
            
            return data.user;
        } catch (error) {
            throw new Error('Admin authentication failed');
        }
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        // Dashboard actions
        document.getElementById('refreshDataBtn').addEventListener('click', () => this.loadDashboardData());
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllData());
        
        // Product management
        document.getElementById('addProductBtn').addEventListener('click', () => this.showProductForm());
        document.getElementById('refreshProductsBtn').addEventListener('click', () => this.refreshProductsFromAPI());
        document.getElementById('exportProductsBtn').addEventListener('click', () => this.exportProducts());
        document.getElementById('productFormElement').addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('cancelProductBtn').addEventListener('click', () => this.hideProductForm());
        
        // Order management
        document.getElementById('exportOrdersBtn').addEventListener('click', () => this.exportOrders());
        
        // User management
        document.getElementById('exportUsersBtn').addEventListener('click', () => this.exportUsers());
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(tabName).classList.remove('hidden');
        
        this.currentTab = tabName;
        
        // Load data for the selected tab
        this.loadTabData(tabName);
    }
    
    async loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'products':
                await this.loadProducts();
                break;
            case 'orders':
                await this.loadOrders();
                break;
            case 'users':
                await this.loadUsers();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
        }
    }
    
    async loadDashboardData() {
        try {
            this.showLoading(true);
            
            // Load all data in parallel
            const [productsRes, ordersRes, usersRes, analyticsRes] = await Promise.all([
                fetch('/api/admin/products', { credentials: 'include' }),
                fetch('/api/admin/orders', { credentials: 'include' }),
                fetch('/api/admin/users', { credentials: 'include' }),
                fetch('/api/admin/analytics', { credentials: 'include' })
            ]);
            
            const products = await productsRes.json();
            const orders = await ordersRes.json();
            const users = await usersRes.json();
            const analytics = await analyticsRes.json();
            
            // Update dashboard stats
            document.getElementById('totalProducts').textContent = products.length;
            document.getElementById('totalOrders').textContent = orders.length;
            document.getElementById('totalUsers').textContent = users.length;
            document.getElementById('totalRevenue').textContent = `₹${analytics.totalRevenue.toFixed(2)}`;
            
            // Show recent activity
            this.renderRecentActivity(orders.slice(0, 5));
            
        } catch (error) {
            console.error('Dashboard data load failed:', error);
            this.showToast('Failed to load dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderRecentActivity(recentOrders) {
        const container = document.getElementById('recentActivity');
        
        if (recentOrders.length === 0) {
            container.innerHTML = '<p>No recent activity</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentOrders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.username || 'Guest'}</td>
                            <td>${order.items.length} items</td>
                            <td>₹${order.total.toFixed(2)}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    async loadProducts() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/admin/products', { credentials: 'include' });
            this.products = await response.json();
            this.renderProductsTable();
        } catch (error) {
            console.error('Products load failed:', error);
            this.showToast('Failed to load products', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderProductsTable() {
        const container = document.getElementById('productsTable');
        
        if (this.products.length === 0) {
            container.innerHTML = '<p>No products found</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Cuisine</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.products.map(product => `
                        <tr>
                            <td>${product.id}</td>
                            <td><img src="${product.image}" alt="${product.name}" class="product-image-preview"></td>
                            <td>${product.name}</td>
                            <td>₹${product.price.toFixed(2)}</td>
                            <td>${product.cuisine || 'N/A'}</td>
                            <td>⭐ ${product.rating || 0}</td>
                            <td>
                                <button class="btn btn-small btn-outline" onclick="admin.editProduct(${product.id})">Edit</button>
                                <button class="btn btn-small btn-danger" onclick="admin.deleteProduct(${product.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    showProductForm(product = null) {
        const form = document.getElementById('productForm');
        const title = document.getElementById('productFormTitle');
        
        form.classList.remove('hidden');
        
        if (product) {
            title.textContent = 'Edit Product';
            this.populateProductForm(product);
        } else {
            title.textContent = 'Add New Product';
            document.getElementById('productFormElement').reset();
            document.getElementById('productId').value = '';
        }
        
        form.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideProductForm() {
        document.getElementById('productForm').classList.add('hidden');
        document.getElementById('productFormElement').reset();
    }
    
    populateProductForm(product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCuisine').value = product.cuisine || '';
        document.getElementById('productDifficulty').value = product.difficulty || 'Easy';
        document.getElementById('productRating').value = product.rating || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productIngredients').value = (product.ingredients || []).join('\n');
        document.getElementById('productInstructions').value = (product.instructions || []).join('\n');
    }
    
    async handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('productId').value,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            cuisine: document.getElementById('productCuisine').value,
            difficulty: document.getElementById('productDifficulty').value,
            rating: parseFloat(document.getElementById('productRating').value) || 0,
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value,
            ingredients: document.getElementById('productIngredients').value.split('\n').filter(i => i.trim()),
            instructions: document.getElementById('productInstructions').value.split('\n').filter(i => i.trim())
        };
        
        try {
            const url = formData.id ? `/api/admin/products/${formData.id}` : '/api/admin/products';
            const method = formData.id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                this.hideProductForm();
                await this.loadProducts();
                this.showToast(formData.id ? 'Product updated successfully' : 'Product added successfully', 'success');
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Product save failed', 'error');
            }
        } catch (error) {
            console.error('Product save failed:', error);
            this.showToast('Product save failed', 'error');
        }
    }
    
    async editProduct(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            this.showProductForm(product);
        }
    }
    
    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                await this.loadProducts();
                this.showToast('Product deleted successfully', 'success');
            } else {
                this.showToast('Failed to delete product', 'error');
            }
        } catch (error) {
            console.error('Product delete failed:', error);
            this.showToast('Product delete failed', 'error');
        }
    }
    
    async refreshProductsFromAPI() {
        try {
            this.showLoading(true);
            this.showToast('Refreshing products from API...', 'info');
            
            const response = await fetch('/api/products/refresh', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                await this.loadProducts();
                this.showToast(result.message || 'Products refreshed successfully', 'success');
            } else {
                this.showToast('Failed to refresh products', 'error');
            }
        } catch (error) {
            console.error('Product refresh failed:', error);
            this.showToast('Product refresh failed', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async loadOrders() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/admin/orders', { credentials: 'include' });
            this.orders = await response.json();
            this.renderOrdersTable();
        } catch (error) {
            console.error('Orders load failed:', error);
            this.showToast('Failed to load orders', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderOrdersTable() {
        const container = document.getElementById('ordersTable');
        
        if (this.orders.length === 0) {
            container.innerHTML = '<p>No orders found</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.orders.map(order => `
                        <tr>
                            <td>#${order.id}</td>
                            <td>${order.username || 'Guest'}</td>
                            <td>
                                <details>
                                    <summary>${order.items.length} items</summary>
                                    <ul style="margin: 5px 0; padding-left: 20px;">
                                        ${order.items.map(item => `
                                            <li>${item.name} (${item.quantity}x ₹${item.price.toFixed(2)})</li>
                                        `).join('')}
                                    </ul>
                                </details>
                            </td>
                            <td>₹${order.total.toFixed(2)}</td>
                            <td>${new Date(order.createdAt).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-small btn-danger" onclick="admin.deleteOrder(${order.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    async deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order?')) return;
        
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                await this.loadOrders();
                this.showToast('Order deleted successfully', 'success');
            } else {
                this.showToast('Failed to delete order', 'error');
            }
        } catch (error) {
            console.error('Order delete failed:', error);
            this.showToast('Order delete failed', 'error');
        }
    }
    
    async loadUsers() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/admin/users', { credentials: 'include' });
            this.users = await response.json();
            this.renderUsersTable();
        } catch (error) {
            console.error('Users load failed:', error);
            this.showToast('Failed to load users', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderUsersTable() {
        const container = document.getElementById('usersTable');
        
        if (this.users.length === 0) {
            container.innerHTML = '<p>No users found</p>';
            return;
        }
        
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Orders</th>
                        <th>Total Spent</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>${user.orderCount || 0}</td>
                            <td>₹${(user.totalSpent || 0).toFixed(2)}</td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                ${user.role !== 'admin' ? `
                                    <button class="btn btn-small btn-outline" onclick="admin.toggleUserRole(${user.id})">
                                        Make ${user.role === 'admin' ? 'User' : 'Admin'}
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="admin.deleteUser(${user.id})">Delete</button>
                                ` : '<span>Admin</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    async toggleUserRole(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/toggle-role`, {
                method: 'PUT',
                credentials: 'include'
            });
            
            if (response.ok) {
                await this.loadUsers();
                this.showToast('User role updated successfully', 'success');
            } else {
                this.showToast('Failed to update user role', 'error');
            }
        } catch (error) {
            console.error('User role toggle failed:', error);
            this.showToast('User role toggle failed', 'error');
        }
    }
    
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This will also delete all their orders.')) return;
        
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                await this.loadUsers();
                this.showToast('User deleted successfully', 'success');
            } else {
                this.showToast('Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('User delete failed:', error);
            this.showToast('User delete failed', 'error');
        }
    }
    
    async loadAnalytics() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/admin/analytics', { credentials: 'include' });
            this.analytics = await response.json();
            this.renderAnalytics();
        } catch (error) {
            console.error('Analytics load failed:', error);
            this.showToast('Failed to load analytics', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    renderAnalytics() {
        const container = document.getElementById('analyticsData');
        
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${this.analytics.totalRevenue?.toFixed(2) || '0.00'}</h3>
                    <p>Total Revenue</p>
                </div>
                <div class="stat-card">
                    <h3>${this.analytics.averageOrderValue?.toFixed(2) || '0.00'}</h3>
                    <p>Average Order Value</p>
                </div>
                <div class="stat-card">
                    <h3>${this.analytics.totalOrders || 0}</h3>
                    <p>Total Orders</p>
                </div>
                <div class="stat-card">
                    <h3>${this.analytics.activeUsers || 0}</h3>
                    <p>Active Users</p>
                </div>
            </div>
            
            <h3>Top Products</h3>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${(this.analytics.topProducts || []).map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.orders}</td>
                            <td>₹${product.revenue.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Export functions
    async exportAllData() {
        try {
            const response = await fetch('/api/admin/export/all', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                this.downloadFile(blob, 'all-data.csv');
                this.showToast('All data exported successfully', 'success');
            } else {
                this.showToast('Export failed', 'error');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed', 'error');
        }
    }
    
    async exportProducts() {
        try {
            const response = await fetch('/api/admin/export/products', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                this.downloadFile(blob, 'products.csv');
                this.showToast('Products exported successfully', 'success');
            } else {
                this.showToast('Export failed', 'error');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed', 'error');
        }
    }
    
    async exportOrders() {
        try {
            const response = await fetch('/api/admin/export/orders', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                this.downloadFile(blob, 'orders.csv');
                this.showToast('Orders exported successfully', 'success');
            } else {
                this.showToast('Export failed', 'error');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed', 'error');
        }
    }
    
    async exportUsers() {
        try {
            const response = await fetch('/api/admin/export/users', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                this.downloadFile(blob, 'users.csv');
                this.showToast('Users exported successfully', 'success');
            } else {
                this.showToast('Export failed', 'error');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed', 'error');
        }
    }
    
    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                this.showToast('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'index-enhanced.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showToast('Logout failed', 'error');
        }
    }
    
    // UI helpers
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'block' : 'none';
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

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminPanel();
});