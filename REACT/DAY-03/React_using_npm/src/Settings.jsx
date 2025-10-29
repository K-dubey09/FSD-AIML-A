import React, { useState } from 'react';

export default function Settings(){
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('bookstore_user')||'null') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return <div style={{padding:12}}>You must be logged in to access settings.</div>;

  async function save(){
    setSaving(true);
    try{
      const res = await fetch(`/api/users/${user.id}`, { method: 'PUT', headers: { 'content-type':'application/json', authorization: token? `Bearer ${token}` : '' }, body: JSON.stringify({ displayName, password: password || undefined }) });
      if (!res.ok) {
        const b = await res.json().catch(()=>({}));
        throw new Error(b.error || 'failed');
      }
      const updated = await res.json();
      // update local storage user copy
      const stored = JSON.parse(localStorage.getItem('bookstore_user')||'null') || {};
      localStorage.setItem('bookstore_user', JSON.stringify({ ...stored, ...updated }));
      alert('Settings saved');
      setPassword('');
    }catch(e){ alert('Save failed: '+e.message); }
    setSaving(false);
  }

  return (
    <div style={{padding:12}}>
      <h2>Settings</h2>
      <div style={{background:'#fff',padding:12,borderRadius:6,maxWidth:480}}>
        <div style={{display:'grid',gap:8}}>
          <label>Display name</label>
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          <label>Change password</label>
          <input type="password" placeholder="Leave blank to keep current" value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{marginTop:8}}>
            <button className="btn" onClick={save} disabled={saving}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
