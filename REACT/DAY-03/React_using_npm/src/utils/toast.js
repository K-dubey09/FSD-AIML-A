// Minimal toast implementation — creates a temporary floating message
export function showToast(message, { timeout = 3000, type = 'info' } = {}){
  try{
    const rootId = 'app-toast-root';
    let root = document.getElementById(rootId);
    if (!root){ root = document.createElement('div'); root.id = rootId; document.body.appendChild(root); root.style.position = 'fixed'; root.style.top = '12px'; root.style.right = '12px'; root.style.zIndex = 9999; }
    const el = document.createElement('div');
    el.textContent = message;
    el.style.background = type === 'error' ? '#ffebee' : (type === 'success' ? '#e6ffed' : '#f3f5f9');
    el.style.color = '#111';
    el.style.padding = '8px 12px';
    el.style.marginTop = '8px';
    el.style.border = '1px solid #e6e9ef';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 6px 18px rgba(16,24,40,0.06)';
    root.appendChild(el);
    setTimeout(()=>{ el.style.opacity = '0'; setTimeout(()=>el.remove(),300); }, timeout);
  }catch(e){ console.log('toast', message); }
}
