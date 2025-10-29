// Client helpers that call backend API. If API is not available, fall back to reading bundled JSON via fetch.
const API = '/api';

export async function loadBooks() {
  try {
    const res = await fetch(`${API}/books`);
    if (!res.ok) throw new Error('api');
    const body = await res.json();
    // API may return { value, count } for paginated responses
    return Array.isArray(body) ? body : (body.value || []);
  } catch (e) {
    // fallback: fetch bundled JSON
    const r = await fetch('/src/data/books.json');
    return await r.json();
  }
}

export async function addBook(book, token) {
  const res = await fetch(`${API}/books`, { method: 'POST', headers: { 'content-type':'application/json', ...(token?{authorization:`Bearer ${token}`}: {}) }, body: JSON.stringify(book) });
  if (!res.ok) throw new Error('failed to add');
  return res.json();
}

export async function updateBook(id, patch, token) {
  const res = await fetch(`${API}/books/${id}`, { method: 'PUT', headers: { 'content-type':'application/json', ...(token?{authorization:`Bearer ${token}`}: {}) }, body: JSON.stringify(patch) });
  if (!res.ok) throw new Error('failed to update');
  return res.json();
}

export async function removeBook(id, token) {
  const res = await fetch(`${API}/books/${id}`, { method: 'DELETE', headers: { ...(token?{authorization:`Bearer ${token}`}: {}) } });
  if (!res.ok) throw new Error('failed to delete');
  return res.json();
}
