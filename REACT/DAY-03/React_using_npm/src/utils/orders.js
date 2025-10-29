// Orders API helper - posts orders to backend and loads via admin endpoint.
const API = '/api';

export async function loadOrders(token) {
  // admin-only endpoint
  const res = await fetch(`${API}/orders`, { headers: { ...(token?{authorization:`Bearer ${token}`}: {}) } });
  if (!res.ok) return [];
  return res.json();
}

export async function saveOrder(order) {
  const res = await fetch(`${API}/orders`, { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify(order) });
  if (!res.ok) return null;
  const body = await res.json();
  return body.id;
}

export async function loadMyOrders(token) {
  // authenticated user's orders
  const res = await fetch(`${API}/my-orders`, { headers: { ...(token?{authorization:`Bearer ${token}`}: {}) } });
  if (!res.ok) return [];
  return res.json();
}

export async function clearOrders() {
  // no-op client-side; admin can clear orders by deleting file from server
  return false;
}
