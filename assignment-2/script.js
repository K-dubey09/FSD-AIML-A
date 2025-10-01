// Function to generate random price between min and max
function generateRandomPrice(min = 149, max = 499) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function fetchData() {
    const url = "https://dummyjson.com/recipes";
    
    // Show loading message
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            let tableData = "";
            
            data.recipes.forEach(recipe => {
                // Generate random price for each recipe
                const randomPrice = generateRandomPrice(149, 499);
                
                tableData += `<tr>
                    <td>${recipe.id}</td>
                    <td>${recipe.name}</td>
                    <td><img src="${recipe.image}" alt="${recipe.name}" style="max-width: 100px; height: 80px; object-fit: cover; border-radius: 5px;"></td>
                    <td>⭐ ${recipe.rating}</td>
                    <td>₹${randomPrice}</td>
                    <td><button class="add-to-cart" onclick="addToCart('${recipe.name}', ${randomPrice}, '${recipe.image}')">Add to Cart</button></td>
                </tr>`;
            });     
            
            tableBody.innerHTML = tableData;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = '<tr><td colspan="6">Error loading data. Please try again.</td></tr>';
        });
}

// Load cart count on page load
function updateCartCount() {
    fetch('http://localhost:3000/cart')
        .then(r => r.json())
        .then(cart => {
            const cartIcon = document.querySelector('.cart-link');
            if (cartIcon) {
                cartIcon.innerHTML = `🛒 (${cart.length})`;
            }
        })
        .catch(() => {
            const cartIcon = document.querySelector('.cart-link');
            if (cartIcon) cartIcon.innerHTML = `🛒 (0)`;
        });
}

// Function to handle add to cart functionality
function addToCart(recipeName, price, image) {
    fetch('http://localhost:3000/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: recipeName, price: parseFloat(price), image, quantity: 1 })
    })
    .then(r => r.json())
    .then(() => {
        alert(`Added "${recipeName}" to cart for ₹${price}`);
        updateCartCount();
    })
    .catch(err => {
        console.error('Error adding to cart', err);
        alert('Failed to add to cart. Is the cart server running?');
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
document.getElementById("fetchDataBtn").addEventListener("click", fetchData);