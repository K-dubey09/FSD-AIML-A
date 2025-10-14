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

    init() {
        this.bindEvents();
        this.loadInitialData();
        this.startAutoRefresh();
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
            const [products, orders, users] = await Promise.all([
                this.fetchData('/api/products'),
                this.fetchData('/api/orders'),
                this.fetchData('/api/users')
            ]);

            const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

            document.getElementById('total-products').textContent = products.length;
            document.getElementById('total-orders').textContent = orders.length;
            document.getElementById('total-users').textContent = users.length;
            document.getElementById('total-revenue').textContent = `₹${totalRevenue.toLocaleString()}`;

            this.data.products = products;
            this.data.orders = orders;
            this.data.users = users;
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
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const tbody = document.getElementById('recent-orders');
        tbody.innerHTML = recentOrders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.items}</td>
                <td>₹${order.total}</td>
                <td><span class="badge badge-${this.getStatusColor(order.status)}">${order.status}</span></td>
                <td>${this.formatDate(order.date)}</td>
            </tr>
        `).join('');
    }

    async loadAnalyticsData() {
        try {
            const analytics = await this.fetchData('/api/analytics');
            this.data.analytics = analytics;
            this.updateAnalyticsCharts();
            this.loadTopProducts();
            this.loadPerformanceMetrics();
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    loadTopProducts() {
        const topProducts = this.data.products
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))
            .slice(0, 5);

        const container = document.getElementById('top-products');
        container.innerHTML = topProducts.map(product => `
            <div class="product-item">
                <span>${product.name}</span>
                <span class="badge badge-primary">${product.sales || 0} sales</span>
            </div>
        `).join('');
    }

    loadPerformanceMetrics() {
        const metrics = [
            { label: 'Conversion Rate', value: '3.24%', trend: 'up' },
            { label: 'Avg Order Value', value: '₹245', trend: 'up' },
            { label: 'Customer Retention', value: '68%', trend: 'down' },
            { label: 'Page Load Time', value: '1.2s', trend: 'up' }
        ];

        const container = document.getElementById('performance-metrics');
        container.innerHTML = metrics.map(metric => `
            <div class="metric-item">
                <span>${metric.label}</span>
                <span class="badge badge-${metric.trend === 'up' ? 'success' : 'warning'}">${metric.value}</span>
            </div>
        `).join('');
    }

    async loadProducts() {
        try {
            // Use admin endpoint for product management (RBAC)
            const products = await this.fetchData('/api/admin/products');
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
            const orders = await this.fetchData('/api/orders');
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
                <td>${order.customer}</td>
                <td>${order.items}</td>
                <td>₹${order.total}</td>
                <td><span class="badge badge-${this.getStatusColor(order.status)}">${order.status}</span></td>
                <td>${this.formatDate(order.date)}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="admin.viewOrder(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="admin.updateOrderStatus(${order.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadUsers() {
        try {
            const users = await this.fetchData('/api/users');
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
                <td>${this.formatDate(user.joinedDate)}</td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'}</td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="admin.editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="admin.deleteUser(${user.id})">
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

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
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

        const data = {
            labels: ['Pending', 'Processing', 'Completed', 'Cancelled'],
            datasets: [{
                data: [15, 25, 45, 15],
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

        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Orders',
                data: [12, 19, 15, 25, 22, 30, 28],
                backgroundColor: '#667eea'
            }, {
                label: 'Revenue',
                data: [8, 12, 10, 18, 15, 22, 20],
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
        // Update charts with real data
        if (this.charts.revenue) {
            // Update revenue chart with actual data
        }
        if (this.charts.status) {
            // Update status chart with actual data
        }
    }

    updateAnalyticsCharts() {
        // Update analytics charts with real data
        if (this.charts.daily) {
            // Update daily chart with actual data
        }
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

        try {
            this.showLoading();
            // Use admin endpoint for adding product
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
            // Use admin endpoint for deleting product
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

    async editUser(id) {
        // Implementation for editing user
        console.log('Edit user:', id);
    }

    async deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            this.showLoading();
            await this.deleteData(`/api/users/${id}`);
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