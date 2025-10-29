import React, { useEffect, useState } from 'react';
import { api } from './utils/api';
import { showToast } from './utils/toast';

export default function MoreOrders(){
  const [orders, setOrders] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        try{
          const data = await api.get('/api/orders');
          if (mounted) setOrders(data || []);
        }catch(err){
          // fallback to my-orders
          try{ const d2 = await api.get('/api/my-orders'); if (mounted) setOrders(d2 || []); }catch(e2){ console.error('load orders', e2); }
        }
      }catch(e){ console.error('load orders', e); }
    })();
    return ()=>{ mounted = false; };
  },[refreshFlag]);

  async function updateStatus(o, status){
    try{
      await api.put(`/api/orders/${o.id}/status`, { status });
      showToast('Order updated', { type: 'success' });
      setRefreshFlag(f=>f+1);
    }catch(e){ showToast('Failed to update: '+(e.message||''), { type:'error' }); }
  }

  return (
    <div style={{padding:12}}>
      <h2>More: Orders</h2>
      <div className="admin-list">
        {orders.length===0 ? <div className="small-muted">No orders</div> : orders.map(o=> (
          <div key={o.id} className="admin-card">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><strong>#{o.id}</strong> {o.customer?.name}</div>
              <div>{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div style={{marginTop:6}}>Total: ₹{Number(o.total||0).toFixed(2)}</div>
            <div style={{marginTop:6}}>Status: {o.status || 'pending'}</div>
            <div style={{marginTop:8,display:'flex',gap:8}}>
              <button className="btn" onClick={()=>updateStatus(o,'shipped')}>Mark shipped</button>
              <button className="btn secondary" onClick={()=>updateStatus(o,'delivered')}>Mark delivered</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
