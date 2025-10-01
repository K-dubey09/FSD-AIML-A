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
    const cartBody = document.getElementById("cart-body");
    const totalElement = document.getElementById("total-amount");

    if (!cart || cart.length === 0) {
        cartBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; font-style: italic; color: #666;">
                    Your cart is empty! Start adding some delicious recipes. 🍽️
                </td>
            </tr>`;
        totalElement.innerHTML = "Total Amount: ₹0.00";
        return;
    }

    let cartHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartHTML += `
            <tr>
                <td>
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 10px;">
                    ${item.name}
                </td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>
                    <button onclick="changeQuantity('${encodeURIComponent(item.name)}', -1)" class="qty-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="changeQuantity('${encodeURIComponent(item.name)}', 1)" class="qty-btn">+</button>
                </td>
                <td>
                    ₹${itemTotal.toFixed(2)}
                    <button onclick="removeItem('${encodeURIComponent(item.name)}')" class="remove-btn">🗑️</button>
                </td>
            </tr>`;
    });

    cartBody.innerHTML = cartHTML;
    totalElement.innerHTML = `Total Amount: ₹${total.toFixed(2)}`;
}

// Change quantity of item
function changeQuantity(index, change) {
    const name = decodeURIComponent(index);
    fetch('http://localhost:3000/cart/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, change })
    })
    .then(r => r.json())
    .then(() => loadCart())
    .catch(err => console.error('Failed to change quantity', err));
}

// Remove item from cart
function removeItem(index) {
    const name = decodeURIComponent(index);
    fetch('http://localhost:3000/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
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
                        alert(`Order placed successfully! Total paid: ₹${res.total.toFixed(2)}`);
                        loadCart();
                    })
                    .catch(err => console.error('Checkout failed', err));
            }
        })
        .catch(err => console.error('Failed to fetch cart for checkout', err));
}

// Load cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});
