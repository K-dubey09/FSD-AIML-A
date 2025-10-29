// Modern Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.apiUrl = 'http://localhost:3000';
        this.currentTab = 'dashboard';
        this.charts = {};
        this.data = {
            products: [],
            orders: [],
            users: [],
            analytics: {}
        };
        this.init();
    }

    async init() {
        // Check authentication first
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            window.location.href = 'store.html';
            return;
        }
        
        this.bindEvents();
        await this.loadInitialData();
        this.startAutoRefresh();
    }
    
    async checkAuth() {
        try {
            const response = await fetch(`${this.apiUrl}/api/me`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.user && data.user.role === 'admin') {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Search and filter events
        this.bindSearchAndFilters();
        
        // Form submissions
        this.bindFormSubmissions();
        
        // Modal events
        this.bindModalEvents();
    }

    bindSearchAndFilters() {
        // Product filters
        const productSearch = document.getElementById('product-search');
        const productCategory = document.getElementById('product-category');
        
        if (productSearch) {
            productSearch.addEventListener('input', () => this.filterProducts());
        }
        
        if (productCategory) {
            productCategory.addEventListener('change', () => this.filterProducts());
        }

        // Order filters
        const orderSearch = document.getElementById('order-search');
        const orderStatus = document.getElementById('order-status');
        
        if (orderSearch) {
            orderSearch.addEventListener('input', () => this.filterOrders());
        }
        
        if (orderStatus) {
            orderStatus.addEventListener('change', () => this.filterOrders());
        }

        // User filters
        const userSearch = document.getElementById('user-search');
        const userRole = document.getElementById('user-role');
        
        if (userSearch) {
            userSearch.addEventListener('input', () => this.filterUsers());
        }
        
        if (userRole) {
            userRole.addEventListener('change', () => this.filterUsers());
        }
    }

    bindFormSubmissions() {
        // Add product form
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }
    }

    bindModalEvents() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            analytics: 'Analytics',
            products: 'Products',
            orders: 'Orders',
            users: 'Users'
        };
        document.getElementById('page-title').textContent = titles[tabName];

        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    async loadInitialData() {
        this.showLoading();
        try {
            await Promise.all([
                this.loadDashboardStats(),
                this.loadProducts(),
                this.loadOrders(),
                this.loadUsers()
            ]);
            this.initializeCharts();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Error loading data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'analytics':
                await this.loadAnalyticsData();
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
        }
    }

    async loadDashboardStats() {
        try {
            const [products, orders, users, analytics] = await Promise.all([
                this.fetchData('/api/products'),
                this.fetchData('/api/admin/orders'),
                this.fetchData('/api/admin/users'),
                this.fetchData('/api/admin/analytics')
            ]);

            const totalRevenue = analytics.totalRevenue || orders.reduce((sum, order) => sum + (order.total || 0), 0);

            document.getElementById('total-products').textContent = analytics.totalProducts || products.length;
            document.getElementById('total-orders').textContent = analytics.totalOrders || orders.length;
            document.getElementById('total-users').textContent = analytics.totalUsers || users.length;
            document.getElementById('total-revenue').textContent = `₹${Math.round(totalRevenue).toLocaleString()}`;

            this.data.products = products;
            this.data.orders = orders;
            this.data.users = users;
            this.data.analytics = analytics;
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    async loadDashboardData() {
        await this.loadDashboardStats();
        this.loadRecentOrders();
        this.updateDashboardCharts();
    }

    loadRecentOrders() {
        const recentOrders = this.data.orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const tbody = document.getElementById('recent-orders');
        if (!tbody) return;
        
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.username || 'N/A'}</td>
                <td>${(order.items || []).length} items</td>
                <td>₹${(order.total || 0).toFixed(2)}</td>
                <td><span class="badge badge-${this.getStatusColor(order.status)}">${order.status}</span></td>
                <td>${this.formatDate(order.createdAt)}</td>
            </tr>
        `).join('');
    }

    async loadAnalyticsData() {
        try {
            const analytics = await this.fetchData('/api/admin/analytics');
            this.data.analytics = analytics;
            this.updateAnalyticsCharts();
            this.loadTopProducts();
            this.loadPerformanceMetrics();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    loadTopProducts() {
        const container = document.getElementById('top-products');
        if (!container) return;
        
        // Use real-time analytics data
        const topProducts = this.data.analytics?.topProducts || [];
        
        if (topProducts.length === 0) {
            container.innerHTML = '<div class="text-muted">No sales data yet</div>';
            return;
        }

        container.innerHTML = topProducts.slice(0, 5).map(product => `
            <div class="product-item">
                <span>${product.name}</span>
                <span class="badge badge-primary">${product.totalSold || 0} sold · ₹${Math.round(product.revenue || 0)}</span>
            </div>
        `).join('');
    }

    loadPerformanceMetrics() {
        const container = document.getElementById('performance-metrics');
        if (!container) return;
        
        const analytics = this.data.analytics;
        
        const conversionRate = analytics?.conversionRate || 0;
        const avgOrderValue = analytics?.averageOrderValue || 0;
        const revenueGrowth = analytics?.revenueGrowth || 0;
        const activeUsers = analytics?.activeUsers || 0;
        
        const metrics = [
            { 
                label: 'Conversion Rate', 
                value: `${conversionRate.toFixed(2)}%`, 
                trend: conversionRate > 2 ? 'up' : 'down' 
            },
            { 
                label: 'Avg Order Value', 
                value: `₹${Math.round(avgOrderValue)}`, 
                trend: avgOrderValue > 200 ? 'up' : 'down' 
            },
            { 
                label: 'Revenue Growth', 
                value: `${revenueGrowth.toFixed(1)}%`, 
                trend: revenueGrowth > 0 ? 'up' : 'down' 
            },
            { 
                label: 'Active Users', 
                value: activeUsers, 
                trend: activeUsers > 0 ? 'up' : 'down' 
            }
        ];

        container.innerHTML = metrics.map(metric => `
            <div class="metric-item">
                <span>${metric.label}</span>
                <span class="badge badge-${metric.trend === 'up' ? 'success' : 'warning'}">${metric.value}</span>
            </div>
        `).join('');
    }

    async loadProducts() {
        try {
            // Load products from standard endpoint
            const products = await this.fetchData('/api/products');
            this.data.products = products;
            this.renderProductsTable(products);
        } catch (error) {
            console.error('Error loading products:', error);
            this.showToast('Error loading products', 'error');
        }
    }

    renderProductsTable(products) {
        const tbody = document.getElementById('products-list');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>${this.renderStars(product.rating || 0)}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="admin.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="admin.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadOrders() {
        try {
            const orders = await this.fetchData('/api/admin/orders');
            this.data.orders = orders;
            this.renderOrdersTable(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showToast('Error loading orders', 'error');
        }
    }

    renderOrdersTable(orders) {
        const tbody = document.getElementById('orders-list');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.username || 'N/A'}</td>
                <td>${(order.items || []).length} items</td>
                <td>₹${(order.total || 0).toFixed(2)}</td>
                <td><span class="badge badge-${this.getStatusColor(order.status)}">${order.status}</span></td>
                <td>${this.formatDate(order.createdAt)}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="admin.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="admin.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadUsers() {
        try {
            const users = await this.fetchData('/api/admin/users');
            this.data.users = users;
            this.renderUsersTable(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Error loading users', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('users-list');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.role === 'admin' ? 'danger' : 'primary'}">${user.role}</span></td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="admin.toggleUserRole('${user.id}')">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="admin.deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    filterProducts() {
        const search = document.getElementById('product-search').value.toLowerCase();
        const category = document.getElementById('product-category').value;

        const filtered = this.data.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(search);
            const matchesCategory = !category || product.category === category;
            return matchesSearch && matchesCategory;
        });

        this.renderProductsTable(filtered);
    }

    filterOrders() {
        const search = document.getElementById('order-search').value.toLowerCase();
        const status = document.getElementById('order-status').value;

        const filtered = this.data.orders.filter(order => {
            const matchesSearch = 
                order.id.toString().includes(search) ||
                order.customer.toLowerCase().includes(search);
            const matchesStatus = !status || order.status === status;
            return matchesSearch && matchesStatus;
        });

        this.renderOrdersTable(filtered);
    }

    filterUsers() {
        const search = document.getElementById('user-search').value.toLowerCase();
        const role = document.getElementById('user-role').value;

        const filtered = this.data.users.filter(user => {
            const matchesSearch = 
                user.username.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search);
            const matchesRole = !role || user.role === role;
            return matchesSearch && matchesRole;
        });

        this.renderUsersTable(filtered);
    }

    initializeCharts() {
        this.createRevenueChart();
        this.createStatusChart();
        this.createDailyChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        // Get monthly trends from analytics
        const monthlyTrends = this.data.analytics?.monthlyTrends || [];
        
        const labels = monthlyTrends.length > 0 
            ? monthlyTrends.map(t => {
                const date = new Date(t.month + '-01');
                return date.toLocaleDateString('en-US', { month: 'short' });
            })
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            
        const revenueData = monthlyTrends.length > 0
            ? monthlyTrends.map(t => Math.round(t.revenue))
            : [0, 0, 0, 0, 0, 0];

        const data = {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: revenueData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createStatusChart() {
        const ctx = document.getElementById('status-chart');
        if (!ctx) return;

        // Calculate real order status distribution
        const orders = this.data.orders || [];
        const statusCounts = {
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0
        };
        
        orders.forEach(order => {
            const status = (order.status || 'completed').toLowerCase();
            if (statusCounts.hasOwnProperty(status)) {
                statusCounts[status]++;
            } else {
                statusCounts.completed++;
            }
        });

        const data = {
            labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
            datasets: [{
                data: [
                    statusCounts.pending,
                    statusCounts.processing,
                    statusCounts.completed,
                    statusCounts.cancelled
                ],
                backgroundColor: [
                    '#ff9800',
                    '#2196F3',
                    '#4CAF50',
                    '#f44336'
                ]
            }]
        };

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createDailyChart() {
        const ctx = document.getElementById('daily-chart');
        if (!ctx) return;

        // Calculate real daily stats from orders (last 7 days)
        const orders = this.data.orders || [];
        const dailyStats = {};
        const today = new Date();
        const labels = [];
        
        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dayName);
            dailyStats[dateKey] = { orders: 0, revenue: 0 };
        }
        
        // Count orders and revenue per day
        orders.forEach(order => {
            const orderDate = order.createdAt?.split('T')[0];
            if (dailyStats[orderDate]) {
                dailyStats[orderDate].orders++;
                dailyStats[orderDate].revenue += (order.total || 0) / 100; // Scale down for chart
            }
        });
        
        const ordersData = Object.values(dailyStats).map(d => d.orders);
        const revenueData = Object.values(dailyStats).map(d => Math.round(d.revenue));

        const data = {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: ordersData,
                backgroundColor: '#667eea'
            }, {
                label: 'Revenue (₹/100)',
                data: revenueData,
                backgroundColor: '#f093fb'
            }]
        };

        this.charts.daily = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateDashboardCharts() {
        // Destroy existing charts and recreate with new data
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }
        if (this.charts.status) {
            this.charts.status.destroy();
        }
        if (this.charts.daily) {
            this.charts.daily.destroy();
        }
        
        // Recreate charts with updated data
        this.createRevenueChart();
        this.createStatusChart();
        this.createDailyChart();
    }

    updateAnalyticsCharts() {
        // Update analytics charts with real-time data
        this.updateDashboardCharts();
    }

    showAddProductModal() {
        this.showModal('add-product-modal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    async addProduct() {
        const form = document.getElementById('add-product-form');
        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());
        
        // Convert numeric fields
        productData.price = parseFloat(productData.price);
        productData.servings = parseInt(productData.servings);
        productData.prepTime = parseInt(productData.prepTime);
        productData.cookTime = parseInt(productData.cookTime);
        productData.rating = 4.0;
        productData.cuisine = productData.category;

        try {
            this.showLoading();
            const response = await this.postData('/api/admin/products', productData);
            this.showToast('Product added successfully', 'success');
            this.closeModal('add-product-modal');
            form.reset();
            await this.loadProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            this.showToast('Error adding product', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async editProduct(id) {
        // TODO: Implement edit product modal and logic using /api/admin/products/:id (PUT)
        console.log('Edit product:', id);
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            this.showLoading();
            await this.deleteData(`/api/admin/products/${id}`);
            this.showToast('Product deleted successfully', 'success');
            await this.loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showToast('Error deleting product', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async viewOrder(id) {
        // Implementation for viewing order details
        console.log('View order:', id);
    }

    async updateOrderStatus(id) {
        // Implementation for updating order status
        console.log('Update order status:', id);
    }

    async toggleUserRole(id) {
        if (!confirm('Are you sure you want to toggle this user\'s role?')) return;

        try {
            this.showLoading();
            await fetch(`${this.apiUrl}/api/admin/users/${id}/toggle-role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            this.showToast('User role toggled successfully', 'success');
            await this.loadUsers();
        } catch (error) {
            console.error('Error toggling user role:', error);
            this.showToast('Error toggling user role', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async deleteOrder(id) {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            this.showLoading();
            await this.deleteData(`/api/admin/orders/${id}`);
            this.showToast('Order deleted successfully', 'success');
            await this.loadOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            this.showToast('Error deleting order', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            this.showLoading();
            await this.deleteData(`/api/admin/users/${id}`);
            this.showToast('User deleted successfully', 'success');
            await this.loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showToast('Error deleting user', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async postData(endpoint, data) {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    async deleteData(endpoint) {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.getElementById('toast-container').appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getStatusColor(status) {
        const colors = {
            pending: 'warning',
            processing: 'primary',
            completed: 'success',
            cancelled: 'danger'
        };
        return colors[status] || 'secondary';
    }

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }

        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }

        return stars;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    async refreshData() {
        await this.loadInitialData();
        this.showToast('Data refreshed successfully', 'success');
    }

    openStore() {
        window.open('store.html', '_blank');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'store.html';
        }
    }

    startAutoRefresh() {
        // Auto-refresh data every 5 minutes
        setInterval(() => {
            this.loadTabData(this.currentTab);
        }, 5 * 60 * 1000);
    }
}

// Global functions for onclick handlers
window.switchTab = (tab) => admin.switchTab(tab);
window.showAddProductModal = () => admin.showAddProductModal();
window.closeModal = (modalId) => admin.closeModal(modalId);
window.refreshData = () => admin.refreshData();
window.openStore = () => admin.openStore();
window.logout = () => admin.logout();

// Initialize admin dashboard when DOM is loaded
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminDashboard();
});