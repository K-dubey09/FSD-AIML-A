import React, { useEffect, useState } from 'react';
import { api } from './utils/api';
import { showToast } from './utils/toast';

export default function MoreSellers(){
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState({ username:'', password:'', displayName:'' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const data = await api.get('/api/sellers');
        if (mounted) setSellers(data || []);
      }catch(e){ console.error('load sellers', e); showToast('Failed to load sellers',{ type:'error' }); }
    })();
    return ()=>{ mounted = false; };
  },[]);

  async function createSeller(){
    try{
      await api.post('/api/sellers', form);
      showToast('Seller created', { type: 'success' });
      setForm({ username:'', password:'', displayName:'' });
      const data = await api.get('/api/sellers');
      setSellers(data || []);
    }catch(e){ showToast('Failed to create seller: '+(e.message||''), { type:'error' }); }
  }

  return (
    <div style={{padding:12}} className="admin-panel">
      <div style={{flex:1}}>
        <h2>More: Sellers</h2>
        <div className="admin-list">
          {sellers.map(s => (
            <div key={s.id} className="admin-card">
              <div style={{fontWeight:700}}>{s.displayName}</div>
              <div className="small-muted">userId: {s.userId}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-side">
        <h4>Create seller (admin)</h4>
        <div className="form-field"><label>Username</label><input placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
        <div className="form-field"><label>Password</label><input placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
        <div className="form-field"><label>Display name</label><input placeholder="Display name" value={form.displayName} onChange={e=>setForm({...form,displayName:e.target.value})} /></div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={createSeller}>Create seller</button>
        </div>
      </div>
    </div>
  );
}
