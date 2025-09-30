// Load and display cart items
function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartBody = document.getElementById("cart-body");
    const totalElement = document.getElementById("total-amount");
    
    if (cart.length === 0) {
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
                    <button onclick="changeQuantity(${index}, -1)" class="qty-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)" class="qty-btn">+</button>
                </td>
                <td>
                    ₹${itemTotal.toFixed(2)}
                    <button onclick="removeItem(${index})" class="remove-btn">🗑️</button>
                </td>
            </tr>`;
    });
    
    cartBody.innerHTML = cartHTML;
    totalElement.innerHTML = `Total Amount: ₹${total.toFixed(2)}`;
}

// Change quantity of item
function changeQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
    }
}

// Remove item from cart
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

// Clear entire cart
function clearCart() {
    if (confirm("Are you sure you want to clear your cart?")) {
        localStorage.removeItem("cart");
        loadCart();
    }
}

// Checkout function
function checkout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (confirm(`Proceed to checkout? Total: ₹${total.toFixed(2)}`)) {
        alert("Order placed successfully! 🎉");
        localStorage.removeItem("cart");
        loadCart();
    }
}

// Load cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
});
