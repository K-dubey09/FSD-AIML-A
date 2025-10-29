const BASE_KEY = 'bookstore_cart_v1';

export function getUser(){
  try { return JSON.parse(localStorage.getItem('bookstore_user')); } catch(e){ return null; }
}

export function getToken(){
  return localStorage.getItem('bookstore_token');
}

function guestKey(){
  return `${BASE_KEY}_guest`;
}

function userKey(user){
  if (!user) return guestKey();
  return `${BASE_KEY}_user_${user.id}`;
}

export async function loadCart() {
  // If logged in, try to fetch server-side cart first
  const user = getUser();
  const token = getToken();
  if (user && token) {
    try{
      const res = await fetch('/api/cart', { headers: { authorization: `Bearer ${token}` } });
      if (res.ok) return await res.json();
    }catch(e){ /* fall back to local */ }
  }

  // fallback to localStorage per-user key
  try {
    const raw = localStorage.getItem(userKey(user));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveCart(cart) {
  const user = getUser();
  const token = getToken();
  // If logged in, persist to server
  if (user && token) {
    try{
      await fetch('/api/cart', { method: 'PUT', headers: { 'content-type':'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(cart) });
      // also keep a local copy for offline
      try{ localStorage.setItem(userKey(user), JSON.stringify(cart)); }catch(e){}
      return;
    }catch(e){ /* continue to local */ }
  }

  try {
    localStorage.setItem(userKey(user), JSON.stringify(cart));
  } catch (e) {
    // ignore
  }
}

export function clearAuth(){
  localStorage.removeItem('bookstore_token');
  localStorage.removeItem('bookstore_user');
}
