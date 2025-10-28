const KEY = 'bookstore_cart_v1';

export function loadCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch (e) {
    // ignore
  }
}
