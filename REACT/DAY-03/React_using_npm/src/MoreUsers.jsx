import React, { useEffect, useState } from 'react';
import { api } from './utils/api';
import { showToast } from './utils/toast';

export default function MoreUsers(){
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username:'', password:'' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const data = await api.get('/api/users');
        if (mounted) setUsers(data || []);
      }catch(e){ console.error('load users', e); /* endpoint may be admin-only */ }
    })();
    return ()=>{ mounted = false; };
  },[]);

  async function register(){
    try{
      await api.post('/api/auth/register', form);
      showToast('User registered', { type: 'success' });
      setForm({ username:'', password:'' });
      try{ const d2 = await api.get('/api/users'); setUsers(d2 || []); }catch(e){}
    }catch(e){ showToast('Failed to register: '+(e.message||''), { type:'error' }); }
  }

  return (
    <div style={{padding:12}} className="admin-panel">
      <div style={{flex:1}}>
        <h2>More: Users</h2>
        <div className="admin-list">
          {users.length===0 ? <div className="small-muted">No users or endpoint not exposed.</div> : users.map(u=> (
            <div key={u.id} className="admin-card">
              <div style={{fontWeight:700}}>{u.username}</div>
              <div className="small-muted">{u.role}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-side">
        <h4>Register user</h4>
        <div className="form-field"><label>Username</label><input placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
        <div className="form-field"><label>Password</label><input placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={register}>Register</button>
        </div>
      </div>
    </div>
  );
}
