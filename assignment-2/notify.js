// Simple toast notifications
function notify(message, type = 'info', timeout = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.right = '16px';
    container.style.top = '16px';
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }

  const t = document.createElement('div');
  t.textContent = message;
  t.style.background = type === 'error' ? '#d9534f' : (type === 'success' ? '#5cb85c' : '#333');
  t.style.color = 'white';
  t.style.padding = '10px 14px';
  t.style.marginTop = '8px';
  t.style.borderRadius = '6px';
  t.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  t.style.opacity = '0';
  t.style.transition = 'opacity 0.25s ease';
  container.appendChild(t);
  requestAnimationFrame(() => t.style.opacity = '1');
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, timeout);
}

// expose for other scripts
window.notify = notify;
