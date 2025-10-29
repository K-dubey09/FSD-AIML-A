import React, { useEffect, useState } from 'react';
import { loadBooks, addBook, updateBook, removeBook } from './utils/books';
import { loadOrders } from './utils/orders';

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:'', author:'', price:0, cover:'', description:'' });
  const [sellerForm, setSellerForm] = useState({ username:'', password:'', displayName:'' });

  useEffect(async ()=>{ 
    const token = localStorage.getItem('bookstore_token');
    setBooks(await loadBooks()); 
    setOrders(await loadOrders(token));
    try{
      const res = await fetch('/api/sellers', { headers: { authorization: token ? `Bearer ${token}` : '' } });
      if (res.ok) setSellers(await res.json());
    }catch(e){}
  }, []);

  function startAdd(){ setEditing('new'); setForm({ title:'', author:'', price:0, cover:'', description:'' }); }
  function startEdit(b){ setEditing(b.id); setForm({ title:b.title, author:b.author, price:b.price, cover:b.cover || '', description:b.description || '' }); }
  async function save(){
    try{
      if (editing === 'new'){
        await addBook({ ...form, price: Number(form.price) }, localStorage.getItem('bookstore_token'));
        setBooks(await loadBooks());
        setEditing(null);
      } else {
        await updateBook(editing, { ...form, price: Number(form.price) }, localStorage.getItem('bookstore_token'));
        setBooks(await loadBooks());
        setEditing(null);
      }
    }catch(e){
      alert('Failed to save: '+e.message);
    }
  }

  async function del(id){ if (!confirm('Delete book?')) return; await removeBook(id, localStorage.getItem('bookstore_token')); setBooks(await loadBooks()); }

  return (
    <div style={{padding:12}}>
      <h2>Admin Panel</h2>
      <section style={{display:'flex',gap:18,alignItems:'flex-start'}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <h3>Books</h3>
            <div>
              <button className="btn" onClick={startAdd}>Add book</button>
            </div>
          </div>
          <div style={{display:'grid',gap:8,marginTop:8}}>
            {books.map(b=> (
              <div key={b.id} style={{padding:8,background:'#fff',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontWeight:700}}>{b.title}</div>
                  <div style={{fontSize:13,color:'#666'}}>{b.author} — ₹{b.price.toFixed(2)}</div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn secondary" onClick={()=>startEdit(b)}>Edit</button>
                  <button className="btn" onClick={()=>del(b.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{width:420}}>
          <h3>{editing ? (editing==='new' ? 'Add book' : 'Edit book') : 'Book details'}</h3>
          {editing ? (
            <div style={{display:'grid',gap:8}}>
              <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
              <input placeholder="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} />
              <input placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} />
              <input placeholder="Cover URL" value={form.cover} onChange={e=>setForm({...form,cover:e.target.value})} />
              <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              <div style={{display:'flex',gap:8}}>
                <button className="btn" onClick={save}>Save</button>
                <button className="btn secondary" onClick={()=>setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{color:'#666'}}>Select a book to edit or click Add book to create a new record.</div>
          )}

          <div style={{marginTop:18}}>
            <h3>Orders ({orders.length})</h3>
            {orders.length===0 ? <div style={{color:'#666'}}>No orders yet.</div> : (
              orders.slice().reverse().map(o=> (
                <div key={o.id} style={{padding:8,background:'#fff',borderRadius:8,marginTop:8}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <div><strong>#{o.id}</strong> {o.customer?.name}</div>
                    <div>{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{marginTop:6}}>Total: ₹{o.total.toFixed(2)}</div>
                </div>
              ))
            )}

            <div style={{marginTop:18}}>
              <h3>Sellers ({sellers.length})</h3>
              <div style={{display:'grid',gap:8,marginTop:8}}>
                {sellers.map(s => (
                  <div key={s.id} style={{padding:8,background:'#fff',borderRadius:8}}>
                    <div style={{fontWeight:700}}>{s.displayName} — <small>{s.userId}</small></div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:8}}>
                <h4>Create seller</h4>
                <input placeholder="Username" value={sellerForm.username} onChange={e=>setSellerForm({...sellerForm,username:e.target.value})} />
                <input placeholder="Password" value={sellerForm.password} onChange={e=>setSellerForm({...sellerForm,password:e.target.value})} />
                <input placeholder="Display name" value={sellerForm.displayName} onChange={e=>setSellerForm({...sellerForm,displayName:e.target.value})} />
                <div style={{marginTop:6}}>
                  <button className="btn" onClick={async ()=>{
                    try{
                      const token = localStorage.getItem('bookstore_token');
                      const res = await fetch('/api/sellers', { method: 'POST', headers: { 'content-type':'application/json', authorization: token?`Bearer ${token}`:'' }, body: JSON.stringify(sellerForm) });
                      if (!res.ok) throw new Error('create failed');
                      setSellers(await (await fetch('/api/sellers', { headers: { authorization: token?`Bearer ${token}`:'' } })).json());
                      setSellerForm({ username:'', password:'', displayName:'' });
                    }catch(e){ alert('Failed to create seller'); }
                  }}>Create seller</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
