// Small API helper used by admin "More*" components
export async function request(path, opts = {}){
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';
  const headers = opts.headers ? {...opts.headers} : {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData)) headers['content-type'] = headers['content-type'] || 'application/json';
  const res = await fetch(path, { ...opts, headers });
  const text = await res.text();
  let data = null;
  try{ data = text ? JSON.parse(text) : null; } catch(e){ data = text; }
  if (!res.ok) {
    const err = (data && data.error) ? data.error : (res.statusText || 'Request failed');
    const e = new Error(err);
    e.status = res.status;
    e.body = data;
    throw e;
  }
  return data;
}

export const api = {
  get: (p) => request(p, { method: 'GET' }),
  post: (p, b) => request(p, { method: 'POST', body: JSON.stringify(b) }),
  put: (p, b) => request(p, { method: 'PUT', body: JSON.stringify(b) }),
  del: (p) => request(p, { method: 'DELETE' })
};
