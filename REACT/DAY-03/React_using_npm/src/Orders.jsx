import React, { useEffect, useState } from 'react';
import { loadOrders, clearOrders } from './utils/orders';
import { getToken } from './utils/storage';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try{
        const token = getToken();
        const res = await loadOrders(token);
        if (mounted) setOrders(Array.isArray(res) ? res : []);
      } catch (e) {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{padding:12}}>Loading orders…</div>;
  if (!orders || orders.length === 0) {
    return <div style={{padding:12}}>No orders yet.</div>;
  }

  return (
    <div style={{padding:8}}>
      <h2>Past Orders</h2>
      <div className="orders-list">
        {orders.slice().reverse().map(o => (
          <div key={o.id} className="order-card">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><strong>Order #{o.id}</strong></div>
              <div>{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div style={{marginTop:8}}>
              <div><strong>Customer:</strong> {o.customer?.name || '—'}</div>
              <div><strong>Items:</strong></div>
              <ul>
                {o.items.map(it => (
                  <li key={it.id}>{it.title} × {it.qty} — ₹{(it.price*it.qty).toFixed(2)}</li>
                ))}
              </ul>
              <div style={{fontWeight:700}}>Total: ₹{o.total.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        <button className="btn" onClick={async () => { await clearOrders(); setOrders([]); }}>Clear orders</button>
      </div>
    </div>
  );
}
