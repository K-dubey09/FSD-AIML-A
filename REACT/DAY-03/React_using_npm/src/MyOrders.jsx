import React, { useEffect, useState } from 'react';
import { getToken } from './utils/storage';
import { loadMyOrders } from './utils/orders';

export default function MyOrders(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try{
        const token = getToken();
        const res = await loadMyOrders(token);
        if (mounted) setOrders(Array.isArray(res) ? res : []);
      } catch (e) {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{padding:12}}>Loading your orders…</div>;
  if (!orders || orders.length === 0) return <div style={{padding:12}}>You have no orders yet.</div>;

  return (
    <div style={{padding:12}}>
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.slice().reverse().map(o => (
          <div key={o.id} className="order-card">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><strong>Order #{o.id}</strong></div>
              <div>{new Date(o.createdAt).toLocaleString()}</div>
            </div>
            <div style={{marginTop:8}}>
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
    </div>
  );
}
