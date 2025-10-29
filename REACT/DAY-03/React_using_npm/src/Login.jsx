import React, { useState } from 'react';

// simple demo auth: admin/admin -> admin role, any other username -> user
const KEY = 'bookstore_user_v1';

export function getUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
}

export function logout() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!username) return setError('Enter a username');
    try{
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ username, password }) });
      if (!res.ok) {
        const b = await res.json().catch(()=>({}));
        return setError(b.error || 'Login failed');
      }
      const body = await res.json();
      // store token and user
      localStorage.setItem('bookstore_token', body.token);
      localStorage.setItem('bookstore_user', JSON.stringify(body.user));
      onLogin && onLogin(body.user);
    } catch (err){
      setError('Login error');
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back</h1>
        {typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost' && (
          <div className="login-tip">
            <strong>Dev Tip:</strong> Use <code>admin/admin</code> for admin panel, <code>user/user</code> for regular user, or <code>seller1/seller1</code> for seller.
          </div>
        )}
        <form onSubmit={submit} style={{display:'grid',gap:16}}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" placeholder="Enter your username" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input id="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
          </div>
          {error && <div style={{color:'var(--danger)',fontWeight:600,fontSize:14}}>{error}</div>}
          <div style={{display:'flex',gap:12,marginTop:8}}>
            <button className="btn" type="submit" style={{flex:1}}>Login</button>
            <button type="button" className="btn secondary" onClick={() => { setUsername(''); setPassword(''); setError(''); }}>Reset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
