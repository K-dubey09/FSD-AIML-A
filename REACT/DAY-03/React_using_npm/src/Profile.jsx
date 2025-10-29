import React, { useEffect, useState } from 'react';
import { getToken, getUser } from './utils/storage';

export default function Profile(){
  const [profile, setProfile] = useState(() => getUser() || null);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('bookstore_token') : '';

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      if (!token) return;
      setLoading(true);
      try{
        const res = await fetch('/api/auth/me', { headers: { authorization: token? `Bearer ${token}` : '' } });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setProfile(data);
      }catch(e){ console.error('load profile', e); }
      setLoading(false);
    })();
    return ()=> mounted = false;
  },[]);

  if (!token) return <div style={{padding:12}}>You must be logged in to view your profile.</div>;

  return (
    <div style={{padding:12}}>
      <h2>Profile</h2>
      {loading ? <div>Loading...</div> : (
        <div style={{background:'#fff',padding:12,borderRadius:6}}>
          <div><strong>Username:</strong> {profile?.username}</div>
          <div><strong>Role:</strong> {profile?.role}</div>
          {profile?.displayName && <div><strong>Display name:</strong> {profile.displayName}</div>}
        </div>
      )}
    </div>
  );
}
