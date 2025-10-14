const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Session configuration
app.use(session({
    secret: 'recipe-store-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Data file paths
const DATA_FILES = {
    users: './users.json',
    products: './products.json',
    orders: './orders.json',
    cart: './cart.json',
    analytics: './analytics.json'
};

// Utility functions for data management
class DataManager {
    static async readData(filepath) {
        try {
            const data = await fs.readFile(filepath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log(`Creating new file: ${filepath}`);
            return [];
        }
    }

    static async writeData(filepath, data) {
        try {
            await fs.mkdir(path.dirname(filepath), { recursive: true });
            await fs.writeFile(filepath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error writing to ${filepath}:`, error);
            return false;
        }
    }

    static async updateAnalytics(action, data) {
        const analytics = await this.readData(DATA_FILES.analytics);
        const today = new Date().toISOString().split('T')[0];
        
        const todayEntry = analytics.find(entry => entry.date === today) || {
            date: today,
            orders: 0,
            revenue: 0,
            newUsers: 0,
            pageViews: 0,
            topProducts: {}
        };

        switch (action) {
            case 'order':
                todayEntry.orders += 1;
                todayEntry.revenue += data.total;
                data.items.forEach(item => {
                    todayEntry.topProducts[item.name] = (todayEntry.topProducts[item.name] || 0) + 1;
                });
                break;
            case 'user':
                todayEntry.newUsers += 1;
                break;
            case 'pageview':
                todayEntry.pageViews += 1;
                break;
        }

        const existingIndex = analytics.findIndex(entry => entry.date === today);
        if (existingIndex >= 0) {
            analytics[existingIndex] = todayEntry;
        } else {
            analytics.push(todayEntry);
        }

        await this.writeData(DATA_FILES.analytics, analytics);
    }
}

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await DataManager.readData(DATA_FILES.users);
        
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        await DataManager.writeData(DATA_FILES.users, users);

        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.json({ 
            message: 'Login successful', 
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const users = await DataManager.readData(DATA_FILES.users);
        
        // Check if user exists
        if (users.find(u => u.username === username || u.email === email)) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        await DataManager.writeData(DATA_FILES.users, users);
        await DataManager.updateAnalytics('user', newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logout successful' });
});

// Get current user session
app.get('/api/me', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        console.log('Fetching products from:', DATA_FILES.products);
        const products = await DataManager.readData(DATA_FILES.products);
        console.log('Products loaded:', products.length, 'items');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        const products = await DataManager.readData(DATA_FILES.products);
        const newProduct = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        await DataManager.writeData(DATA_FILES.products, products);
        res.status(201).json({ message: 'Product created', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const products = await DataManager.readData(DATA_FILES.products);
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }

        products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
        await DataManager.writeData(DATA_FILES.products, products);
        res.json({ message: 'Product updated', product: products[index] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
        const products = await DataManager.readData(DATA_FILES.products);
        const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));
        
        if (products.length === filteredProducts.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await DataManager.writeData(DATA_FILES.products, filteredProducts);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Cart Routes
app.get('/api/cart', requireAuth, async (req, res) => {
    try {
        const carts = await DataManager.readData(DATA_FILES.cart);
        const userCart = carts.find(c => c.userId === req.session.user.id) || { userId: req.session.user.id, items: [] };
        res.json(userCart);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

app.post('/api/cart/add', requireAuth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const carts = await DataManager.readData(DATA_FILES.cart);
        const products = await DataManager.readData(DATA_FILES.products);
        
        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let userCartIndex = carts.findIndex(c => c.userId === req.session.user.id);
        if (userCartIndex === -1) {
            carts.push({ userId: req.session.user.id, items: [] });
            userCartIndex = carts.length - 1;
        }

        const existingItemIndex = carts[userCartIndex].items.findIndex(item => item.productId === productId);
        if (existingItemIndex >= 0) {
            carts[userCartIndex].items[existingItemIndex].quantity += quantity;
        } else {
            carts[userCartIndex].items.push({
                productId,
                name: product.name,
                price: product.price,
                quantity,
                addedAt: new Date().toISOString()
            });
        }

        await DataManager.writeData(DATA_FILES.cart, carts);
        res.json({ message: 'Item added to cart', cart: carts[userCartIndex] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

app.delete('/api/cart/remove/:productId', requireAuth, async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const carts = await DataManager.readData(DATA_FILES.cart);
        
        const userCartIndex = carts.findIndex(c => c.userId === req.session.user.id);
        if (userCartIndex >= 0) {
            carts[userCartIndex].items = carts[userCartIndex].items.filter(item => item.productId !== productId);
            await DataManager.writeData(DATA_FILES.cart, carts);
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Order Routes
app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        const orders = await DataManager.readData(DATA_FILES.orders);
        if (req.session.user.role === 'admin') {
            res.json(orders);
        } else {
            const userOrders = orders.filter(o => o.userId === req.session.user.id);
            res.json(userOrders);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', requireAuth, async (req, res) => {
    try {
        const carts = await DataManager.readData(DATA_FILES.cart);
        const orders = await DataManager.readData(DATA_FILES.orders);
        
        const userCart = carts.find(c => c.userId === req.session.user.id);
        if (!userCart || userCart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const total = userCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const newOrder = {
            id: Date.now(),
            userId: req.session.user.id,
            username: req.session.user.username,
            items: userCart.items,
            total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        orders.push(newOrder);
        await DataManager.writeData(DATA_FILES.orders, orders);

        // Clear cart
        const cartIndex = carts.findIndex(c => c.userId === req.session.user.id);
        if (cartIndex >= 0) {
            carts[cartIndex].items = [];
            await DataManager.writeData(DATA_FILES.cart, carts);
        }

        await DataManager.updateAnalytics('order', newOrder);
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: 'Failed to place order' });
    }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orders = await DataManager.readData(DATA_FILES.orders);
        
        const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        await DataManager.writeData(DATA_FILES.orders, orders);
        res.json({ message: 'Order status updated', order: orders[orderIndex] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// User Management Routes
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await DataManager.readData(DATA_FILES.users);
        const safeUsers = users.map(({ password, ...user }) => user);
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/api/users/:id/role', requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const users = await DataManager.readData(DATA_FILES.users);
        
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[userIndex].role = role;
        await DataManager.writeData(DATA_FILES.users, users);
        res.json({ message: 'User role updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Analytics Routes
app.get('/api/analytics', requireAdmin, async (req, res) => {
    try {
        const analytics = await DataManager.readData(DATA_FILES.analytics);
        const orders = await DataManager.readData(DATA_FILES.orders);
        const users = await DataManager.readData(DATA_FILES.users);
        const products = await DataManager.readData(DATA_FILES.products);

        const summary = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            totalUsers: users.length,
            totalProducts: products.length,
            dailyAnalytics: analytics,
            recentOrders: orders.slice(-10).reverse(),
            topProducts: analytics.reduce((acc, day) => {
                Object.entries(day.topProducts || {}).forEach(([product, count]) => {
                    acc[product] = (acc[product] || 0) + count;
                });
                return acc;
            }, {})
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Page view tracking
app.get('/', async (req, res) => {
    await DataManager.updateAnalytics('pageview', {});
    res.redirect('/store.html');
});

// Initialize data files with sample data
async function initializeData() {
    try {
        // Check if products.json already exists and has data
        const existingProducts = await DataManager.readData(DATA_FILES.products);
        if (existingProducts.length > 0) {
            console.log('✅ Products already exist, skipping initialization');
            return;
        }
        
        // Sample users
        const users = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@recipestore.com',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                createdAt: new Date().toISOString(),
                lastLogin: null
            },
            {
                id: 2,
                username: 'user',
                email: 'user@example.com',
                password: await bcrypt.hash('user123', 10),
                role: 'user',
                createdAt: new Date().toISOString(),
                lastLogin: null
            }
        ];

        // Sample products
        const products = [
            {
                id: 1,
                name: 'Butter Chicken',
                description: 'Creamy and rich Indian curry with tender chicken',
                price: 299,
                category: 'Indian',
                cuisine: 'Indian',
                image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300',
                ingredients: ['chicken', 'butter', 'tomatoes', 'cream', 'spices'],
                prepTime: 20,
                cookTime: 30,
                servings: 4,
                rating: 4.5,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Margherita Pizza',
                description: 'Classic Italian pizza with tomatoes, mozzarella, and basil',
                price: 249,
                category: 'Italian',
                cuisine: 'Italian',
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
                ingredients: ['dough', 'tomato sauce', 'mozzarella', 'basil'],
                prepTime: 15,
                cookTime: 12,
                servings: 2,
                rating: 4.3,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Chicken Teriyaki',
                description: 'Sweet and savory Japanese grilled chicken',
                price: 279,
                category: 'Japanese',
                cuisine: 'Japanese',
                image: 'https://images.unsplash.com/photo-1572441102-e8b5a2fe5d6a?w=300',
                ingredients: ['chicken', 'teriyaki sauce', 'vegetables'],
                prepTime: 15,
                cookTime: 20,
                servings: 3,
                rating: 4.4,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Greek Salad',
                description: 'Fresh Mediterranean salad with feta and olives',
                price: 189,
                category: 'Mediterranean',
                cuisine: 'Mediterranean',
                image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300',
                ingredients: ['tomatoes', 'cucumber', 'olives', 'feta cheese'],
                prepTime: 10,
                cookTime: 0,
                servings: 2,
                rating: 4.0,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Fish Tacos',
                description: 'Fresh and zesty Mexican-style fish tacos',
                price: 229,
                category: 'Mexican',
                cuisine: 'Mexican',
                image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
                ingredients: ['fish', 'tortillas', 'cabbage', 'lime', 'cilantro'],
                prepTime: 15,
                cookTime: 10,
                servings: 3,
                rating: 4.3,
                createdAt: new Date().toISOString()
            }
        ];

        // Initialize files
        await DataManager.writeData(DATA_FILES.users, users);
        await DataManager.writeData(DATA_FILES.products, products);
        await DataManager.writeData(DATA_FILES.orders, []);
        await DataManager.writeData(DATA_FILES.cart, []);
        await DataManager.writeData(DATA_FILES.analytics, []);

        console.log('✅ Data files initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing data:', error);
    }
}

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Recipe Store Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`🏪 Store Front: http://localhost:${PORT}/store.html`);
    
    // Initialize data on startup
    await initializeData();
    
    console.log('✅ Server ready and data initialized');
});