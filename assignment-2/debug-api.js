// Debug script to test all API endpoints
const fetch = require('node-fetch');

async function testEndpoints() {
    console.log('🔍 Testing API endpoints...\n');
    
    // Test products endpoint
    try {
        console.log('Testing /api/products...');
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
            const products = await response.json();
            console.log(`✅ Products: ${products.length} items fetched`);
            console.log(`   Sample: ${products[0]?.name || 'No products'}`);
        } else {
            console.log(`❌ Products: HTTP ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Products: ${error.message}`);
    }
    
    // Test cart endpoint (should fail without auth)
    try {
        console.log('\nTesting /api/cart (without auth)...');
        const response = await fetch('http://localhost:3000/api/cart');
        if (response.status === 401) {
            console.log('✅ Cart: Correctly requires authentication');
        } else {
            console.log(`❌ Cart: Unexpected status ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Cart: ${error.message}`);
    }
    
    // Test login endpoint
    try {
        console.log('\nTesting login with demo credentials...');
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Login: Success');
            console.log(`   User: ${result.user?.username}, Role: ${result.user?.role}`);
        } else {
            const error = await response.json();
            console.log(`❌ Login: ${error.error || 'Failed'}`);
        }
    } catch (error) {
        console.log(`❌ Login: ${error.message}`);
    }
}

testEndpoints();