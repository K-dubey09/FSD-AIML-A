const fetch = require('node-fetch');
const fs = require('fs').promises;

class APIRecoveryService {
    constructor() {
        this.apiEndpoints = {
            recipes: 'https://dummyjson.com/recipes?limit=50',
            users: 'https://dummyjson.com/users?limit=10'
        };
    }

    async fetchRecipesFromAPI() {
        try {
            console.log('Fetching recipes from external API...');
            const response = await fetch(this.apiEndpoints.recipes);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Transform API data to our format
            const products = data.recipes.map((recipe, index) => ({
                id: recipe.id || (index + 1),
                name: recipe.name,
                description: recipe.instructions?.[0] || 'Delicious recipe',
                image: recipe.image || 'https://via.placeholder.com/300x200?text=Recipe',
                cuisine: recipe.cuisine || 'International',
                difficulty: recipe.difficulty || 'Easy',
                prepTimeMinutes: recipe.prepTimeMinutes || 15,
                cookTimeMinutes: recipe.cookTimeMinutes || 20,
                servings: recipe.servings || 4,
                ingredients: recipe.ingredients || [],
                instructions: recipe.instructions || [],
                tags: recipe.tags || [],
                rating: recipe.rating || Math.round((Math.random() * 2 + 3) * 10) / 10,
                reviewCount: recipe.reviewCount || Math.floor(Math.random() * 100) + 10,
                price: this.generatePrice(recipe.difficulty, recipe.prepTimeMinutes, recipe.cookTimeMinutes),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));
            
            return products;
        } catch (error) {
            console.error('Error fetching recipes from API:', error);
            throw error;
        }
    }

    generatePrice(difficulty = 'Easy', prepTime = 15, cookTime = 20) {
        const basePrice = 200;
        const difficultyMultiplier = {
            'Easy': 1,
            'Medium': 1.3,
            'Hard': 1.6
        };
        
        const timeMultiplier = Math.max(0.8, ((prepTime + cookTime) / 30));
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        
        const price = basePrice * (difficultyMultiplier[difficulty] || 1) * timeMultiplier * randomFactor;
        return Math.round(price * 100) / 100;
    }

    async createDefaultAdmin() {
        const bcrypt = require('bcryptjs');
        const adminUser = {
            id: 'admin-default-001',
            username: 'admin',
            email: 'admin@recipestore.com',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        return adminUser;
    }

    async initializeDefaultData() {
        try {
            // Initialize products
            const products = await this.fetchRecipesFromAPI();
            await fs.writeFile('./products.json', JSON.stringify(products, null, 2));
            
            // Initialize admin user
            const admin = await this.createDefaultAdmin();
            const users = [admin];
            await fs.writeFile('./users.json', JSON.stringify(users, null, 2));
            
            // Initialize empty data files
            await fs.writeFile('./cart.json', JSON.stringify([], null, 2));
            await fs.writeFile('./orders.json', JSON.stringify([], null, 2));
            
            // Initialize prices
            const prices = {};
            products.forEach(product => {
                prices[product.id] = product.price;
            });
            await fs.writeFile('./prices.json', JSON.stringify(prices, null, 2));
            
            // Initialize analytics
            const analytics = {
                totalRevenue: 0,
                totalOrders: 0,
                totalUsers: 1,
                averageOrderValue: 0,
                topProducts: [],
                monthlyRevenue: {},
                lastUpdated: new Date().toISOString()
            };
            await fs.writeFile('./analytics.json', JSON.stringify(analytics, null, 2));
            
            return {
                success: true,
                message: 'Default data initialized successfully',
                stats: {
                    products: products.length,
                    users: 1,
                    admin: 'admin/admin123'
                }
            };
        } catch (error) {
            console.error('Error initializing default data:', error);
            throw error;
        }
    }

    async recoverDataFromAPI() {
        try {
            console.log('Starting data recovery from API...');
            
            // Backup existing data first
            const BackupService = require('./backup-service');
            const backupService = new BackupService();
            await backupService.createBackup('pre-recovery');
            
            // Fetch fresh data
            const products = await this.fetchRecipesFromAPI();
            
            // Read existing users to preserve them
            let existingUsers = [];
            try {
                const usersData = await fs.readFile('./users.json', 'utf8');
                existingUsers = JSON.parse(usersData);
            } catch (error) {
                // If no users exist, create default admin
                const admin = await this.createDefaultAdmin();
                existingUsers = [admin];
            }
            
            // Update products
            await fs.writeFile('./products.json', JSON.stringify(products, null, 2));
            
            // Update prices
            const prices = {};
            products.forEach(product => {
                prices[product.id] = product.price;
            });
            await fs.writeFile('./prices.json', JSON.stringify(prices, null, 2));
            
            // Keep existing users, orders, cart, and analytics
            await fs.writeFile('./users.json', JSON.stringify(existingUsers, null, 2));
            
            return {
                success: true,
                message: 'Data recovered successfully from API',
                stats: {
                    productsRecovered: products.length,
                    usersPreserved: existingUsers.length
                }
            };
        } catch (error) {
            console.error('Error recovering data from API:', error);
            throw error;
        }
    }
}

module.exports = APIRecoveryService;