// Load and display cart items
function loadCart() {
    fetch('http://localhost:3000/cart')
        .then(r => r.json())
        .then(cart => {
            renderCart(cart);
        })
        .catch(err => {
            console.error('Failed to load cart', err);
            renderCart([]);
        });
}

function renderCart(cart) {
    const cartBody = document.getElementById('cart-body');
    const totalElement = document.getElementById('total-amount');

    cartBody.innerHTML = '';

    if (!cart || cart.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.style.textAlign = 'center';
        td.style.padding = '40px';
        td.style.fontStyle = 'italic';
        td.style.color = '#666';
        td.textContent = 'Your cart is empty! Start adding some delicious recipes. 🍽️';
        tr.appendChild(td);
        cartBody.appendChild(tr);
        totalElement.innerHTML = 'Total Amount: ₹0.00';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const tr = document.createElement('tr');

        const tdInfo = document.createElement('td');
        const img = document.createElement('img');
        img.src = item.image || '';
        img.alt = item.name;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '5px';
        img.style.marginRight = '10px';
        tdInfo.appendChild(img);
        tdInfo.appendChild(document.createTextNode(item.name));

        const tdPrice = document.createElement('td');
        tdPrice.textContent = `₹${item.price.toFixed(2)}`;

        const tdQty = document.createElement('td');
        const btnMinus = document.createElement('button');
        btnMinus.type = 'button';
        btnMinus.className = 'qty-btn';
        btnMinus.textContent = '-';
        btnMinus.addEventListener('click', function (e) {
            e.preventDefault();
            changeQuantity(item.id, -1);
            return false;
        });

        const spanQty = document.createElement('span');
        spanQty.className = 'quantity';
        spanQty.textContent = item.quantity;

        const btnPlus = document.createElement('button');
        btnPlus.type = 'button';
        btnPlus.className = 'qty-btn';
        btnPlus.textContent = '+';
        btnPlus.addEventListener('click', function (e) {
            e.preventDefault();
            changeQuantity(item.id, 1);
            return false;
        });

        tdQty.appendChild(btnMinus);
        tdQty.appendChild(spanQty);
        tdQty.appendChild(btnPlus);

        const tdTotal = document.createElement('td');
        tdTotal.textContent = `₹${itemTotal.toFixed(2)}`;
        const btnRemove = document.createElement('button');
        btnRemove.type = 'button';
        btnRemove.className = 'remove-btn';
        btnRemove.textContent = '🗑️';
        btnRemove.style.marginLeft = '10px';
        btnRemove.addEventListener('click', function (e) {
            e.preventDefault();
            removeItem(item.id);
            return false;
        });
        tdTotal.appendChild(btnRemove);

        tr.appendChild(tdInfo);
        tr.appendChild(tdPrice);
        tr.appendChild(tdQty);
        tr.appendChild(tdTotal);

        cartBody.appendChild(tr);
    });

    totalElement.innerHTML = `Total Amount: ₹${total.toFixed(2)}`;
}

// Change quantity of item
function changeQuantity(id, change) {
    fetch('http://localhost:3000/cart/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, change })
    })
    .then(r => r.json())
    .then(() => loadCart())
    .catch(err => console.error('Failed to change quantity', err));
}

// Remove item from cart
function removeItem(id) {
    fetch('http://localhost:3000/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(r => r.json())
    .then(() => loadCart())
    .catch(err => console.error('Failed to remove item', err));
}

// Clear entire cart
function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
        fetch('http://localhost:3000/cart/clear', { method: 'POST' })
            .then(r => r.json())
            .then(() => loadCart())
            .catch(err => console.error('Failed to clear cart', err));
    }
}

// Checkout function
function checkout() {
    fetch('http://localhost:3000/cart')
        .then(r => r.json())
        .then(cart => {
            if (!cart || cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (confirm(`Proceed to checkout? Total: ₹${total.toFixed(2)}`)) {
                fetch('http://localhost:3000/cart/checkout', { method: 'POST' })
                    .then(r => r.json())
                    .then(res => {
                        if (window.notify) notify(`Order placed successfully! Total paid: ₹${res.total.toFixed(2)}`, 'success');
                        loadCart();
                    })
                    .catch(err => { console.error('Checkout failed', err); if (window.notify) notify('Checkout failed', 'error'); });
            }
        })
        .catch(err => console.error('Failed to fetch cart for checkout', err));
}

// Load cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});
