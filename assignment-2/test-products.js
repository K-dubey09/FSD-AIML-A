// Test script to verify products are fetched from products.json
const fetch = require('node-fetch');
const fs = require('fs');

async function testProductsFetch() {
    try {
        console.log('🔍 Testing products API endpoint...');
        
        // Read products.json directly
        const productsFromFile = JSON.parse(fs.readFileSync('./products.json', 'utf8'));
        console.log(`📁 Products in products.json: ${productsFromFile.length} items`);
        
        // Fetch from API
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const productsFromAPI = await response.json();
        console.log(`🌐 Products from API: ${productsFromAPI.length} items`);
        
        // Compare
        if (productsFromFile.length === productsFromAPI.length) {
            console.log('✅ SUCCESS: API is correctly fetching products from products.json!');
            
            // Show sample data
            console.log('\n📋 Sample product from API:');
            if (productsFromAPI.length > 0) {
                const sample = productsFromAPI[0];
                console.log(`   Name: ${sample.name}`);
                console.log(`   Price: ₹${sample.price}`);
                console.log(`   Cuisine: ${sample.cuisine}`);
                console.log(`   Rating: ${sample.rating}`);
            }
        } else {
            console.log('❌ MISMATCH: API data does not match products.json');
        }
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

// Run the test
testProductsFetch();