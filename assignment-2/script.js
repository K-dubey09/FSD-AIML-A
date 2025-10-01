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
            // Request persistent prices for these recipe ids from the server
            const ids = data.recipes.map(r => r.id);
            fetch('http://localhost:3000/prices/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            })
            .then(r => r.json())
            .then(pricesMap => {
                // Build rows using DOM methods (prices come from server)
                tableBody.innerHTML = '';
                data.recipes.forEach(recipe => {
                    const randomPrice = pricesMap[String(recipe.id)] || generateRandomPrice(149, 499);

                const tr = document.createElement('tr');

                const tdId = document.createElement('td');
                tdId.textContent = recipe.id;

                const tdName = document.createElement('td');
                tdName.textContent = recipe.name;

                const tdImg = document.createElement('td');
                const img = document.createElement('img');
                img.src = recipe.image;
                img.alt = recipe.name;
                img.style.maxWidth = '100px';
                img.style.height = '80px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '5px';
                tdImg.appendChild(img);

                const tdRating = document.createElement('td');
                tdRating.textContent = `⭐ ${recipe.rating}`;

                const tdPrice = document.createElement('td');
                tdPrice.textContent = `₹${randomPrice}`;

                const tdAction = document.createElement('td');
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'add-to-cart';
                btn.dataset.name = encodeURIComponent(recipe.name);
                btn.dataset.price = randomPrice;
                btn.dataset.image = encodeURIComponent(recipe.image || '');
                btn.textContent = 'Add to Cart';
                btn.addEventListener('click', function (e) {
                    const name = decodeURIComponent(this.dataset.name);
                    const price = parseFloat(this.dataset.price);
                    const image = decodeURIComponent(this.dataset.image);
                    addToCart(name, price, image);
                    e.preventDefault();
                    return false;
                });
                tdAction.appendChild(btn);

                tr.appendChild(tdId);
                tr.appendChild(tdName);
                tr.appendChild(tdImg);
                tr.appendChild(tdRating);
                tr.appendChild(tdPrice);
                tr.appendChild(tdAction);

                    tableBody.appendChild(tr);
                });
            })
            .catch(err => {
                console.error('Failed to fetch prices, falling back to local generation', err);
                // Fallback: render with local generated prices
                tableBody.innerHTML = '';
                data.recipes.forEach(recipe => {
                    const randomPrice = generateRandomPrice(149, 499);

                    const tr = document.createElement('tr');

                    const tdId = document.createElement('td');
                    tdId.textContent = recipe.id;

                    const tdName = document.createElement('td');
                    tdName.textContent = recipe.name;

                    const tdImg = document.createElement('td');
                    const img = document.createElement('img');
                    img.src = recipe.image;
                    img.alt = recipe.name;
                    img.style.maxWidth = '100px';
                    img.style.height = '80px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '5px';
                    tdImg.appendChild(img);

                    const tdRating = document.createElement('td');
                    tdRating.textContent = `⭐ ${recipe.rating}`;

                    const tdPrice = document.createElement('td');
                    tdPrice.textContent = `₹${randomPrice}`;

                    const tdAction = document.createElement('td');
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'add-to-cart';
                    btn.dataset.name = encodeURIComponent(recipe.name);
                    btn.dataset.price = randomPrice;
                    btn.dataset.image = encodeURIComponent(recipe.image || '');
                    btn.textContent = 'Add to Cart';
                    btn.addEventListener('click', function (e) {
                        const name = decodeURIComponent(this.dataset.name);
                        const price = parseFloat(this.dataset.price);
                        const image = decodeURIComponent(this.dataset.image);
                        addToCart(name, price, image);
                        e.preventDefault();
                        return false;
                    });
                    tdAction.appendChild(btn);

                    tr.appendChild(tdId);
                    tr.appendChild(tdName);
                    tr.appendChild(tdImg);
                    tr.appendChild(tdRating);
                    tr.appendChild(tdPrice);
                    tr.appendChild(tdAction);

                    tableBody.appendChild(tr);
                });
            });
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