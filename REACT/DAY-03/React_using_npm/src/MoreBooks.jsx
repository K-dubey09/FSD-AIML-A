import React, { useEffect, useState } from 'react';
import { api } from './utils/api';
import { showToast } from './utils/toast';

export default function MoreBooks(){
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title:'', author:'', price:0, cover:'', description:'', category:'' });
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const data = await api.get('/api/books');
        const list = Array.isArray(data) ? data : (data.value || []);
        if (mounted) setBooks(list);
      }catch(e){ console.error('load books', e); showToast('Failed to load books','error'); }
    })();
    return ()=>{ mounted = false; };
  },[]);

  async function createBook(){
    try{
      const created = await api.post('/api/books', form);
      showToast('Book created', { type: 'success' });
      setForm({ title:'', author:'', price:0, cover:'', description:'', category:'' });
      const d2 = await api.get('/api/books');
      setBooks(Array.isArray(d2) ? d2 : (d2.value||[]));
    }catch(e){ showToast('Failed to create book: '+(e.message||e.body||''), { type: 'error' }); }
  }

  return (
    <div style={{padding:12}} className="admin-panel">
      <div style={{flex:1}}>
        <h2>More: Books</h2>
        <div className="admin-list">
          {books.map(b=> (
            <div key={b.id} className="admin-card">
              <div style={{fontWeight:700}}>{b.title}</div>
              <div className="small-muted">{b.author} — ₹{Number(b.price||0).toFixed(2)}</div>
              <div style={{marginTop:6}} className="small-muted">{b.category}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-side">
        <h4>Create book</h4>
        <div className="form-field"><label>Title</label><input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
        <div className="form-field"><label>Author</label><input placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} /></div>
        <div className="form-field"><label>Price</label><input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} /></div>
        <div className="form-field"><label>Category</label><input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></div>
        <div className="form-field"><label>Cover URL</label><input placeholder="Cover URL" value={form.cover} onChange={e=>setForm({...form,cover:e.target.value})} /></div>
        <div className="form-field"><label>Description</label><textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
        <div style={{marginTop:8}}>
          <button className="btn" onClick={createBook}>Create</button>
        </div>
      </div>
    </div>
  );
}
