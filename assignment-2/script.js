// Function to generate random price between min and max
function generateRandomPrice(min = 149, max = 499) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function fetchData() {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

        // Try to load stored products first
        fetch('/products')
            .then(r => r.json())
            .then(products => {
                if (!products || products.length === 0) {
                    // refresh from external API
                    return fetch('/products/refresh', { method: 'POST' })
                        .then(r => r.json())
                        .then(() => fetch('/products').then(r => r.json()));
                }
                return products;
            })
            .then(products => {
                window._products = products || [];
                renderProducts(window._products);
            })
            .catch(err => {
                console.error('Failed to load products', err);
                tableBody.innerHTML = '<tr><td colspan="6">Error loading data. Please try again.</td></tr>';
            });

}


function renderProducts(products) {
    const tableBody = document.getElementById('table-body');
    const statusEl = document.getElementById('status');
    tableBody.innerHTML = '';

    const search = (document.getElementById('searchBox') || {}).value || '';
    const sort = (document.getElementById('sortSelect') || {}).value || 'default';

    let list = products.slice();
    if (search) {
        const q = search.toLowerCase();
        list = list.filter(p => (p.name||'').toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
    if (sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
    if (sort === 'rating-desc') list.sort((a,b)=> (b.rating||0)-(a.rating||0));

    if (!list || list.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px">No recipes found</td></tr>';
        if (statusEl) statusEl.textContent = '';
        return;
    }

    list.forEach(recipe => {
        const tr = document.createElement('tr');
        const tdId = document.createElement('td'); tdId.textContent = recipe.id;
        const tdName = document.createElement('td'); tdName.textContent = recipe.name;
        const tdImg = document.createElement('td');
        const img = document.createElement('img'); img.src = recipe.image || ''; img.alt = recipe.name || '';
        img.style.maxWidth='100px'; img.style.height='80px'; img.style.objectFit='cover'; img.style.borderRadius='5px'; tdImg.appendChild(img);
        const tdRating = document.createElement('td'); tdRating.textContent = `⭐ ${recipe.rating||0}`;
        const tdPrice = document.createElement('td'); tdPrice.textContent = `₹${(recipe.price||0).toFixed(2)}`;
        const tdAction = document.createElement('td');

        const btn = document.createElement('button'); btn.type='button'; btn.className='add-to-cart'; btn.textContent='Add to Cart';
        btn.addEventListener('click', ()=> addToCart(recipe.id, recipe.name, recipe.price, recipe.image, 1));
        tdAction.appendChild(btn);

        const detailsBtn = document.createElement('button'); detailsBtn.type='button'; detailsBtn.textContent='Details'; detailsBtn.style.marginLeft='8px';
        detailsBtn.addEventListener('click', ()=> window.openProductDetails && window.openProductDetails({...recipe, quantity:1}));
        tdAction.appendChild(detailsBtn);

        tr.appendChild(tdId); tr.appendChild(tdName); tr.appendChild(tdImg); tr.appendChild(tdRating); tr.appendChild(tdPrice); tr.appendChild(tdAction);
        tableBody.appendChild(tr);
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
function addToCart(id, recipeName, price, image, quantity = 1) {
    fetch('http://localhost:3000/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: recipeName, price: parseFloat(price), image, quantity })
    })
    .then(r => r.json())
    .then(() => {
        if (window.notify) notify(`Added "${recipeName}" x${quantity} to cart for ₹${(price * quantity).toFixed(2)}`, 'success');
        updateCartCount();
    })
    .catch(err => {
        console.error('Error adding to cart', err);
        if (window.notify) notify('Failed to add to cart. Is the cart server running?', 'error');
    });
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
document.getElementById("fetchDataBtn").addEventListener("click", fetchData);
// wire search/sort controls
const sb = document.getElementById('searchBox');
if (sb) sb.addEventListener('input', () => renderProducts(window._products || []));
const ss = document.getElementById('sortSelect');
if (ss) ss.addEventListener('change', () => renderProducts(window._products || []));