// Lightweight React entry that runs directly in the browser using esm.sh ESM builds.
// No build step required. Recommended for demos only (depends on network).

import * as React from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

function App() {
    return React.createElement(
        'div',
        { style: { fontFamily: 'Arial, Helvetica, sans-serif', padding: 20, color: '#222' } },
        React.createElement('h1', null, 'Hello from REACT/DAY-02'),
        React.createElement('p', null, 'This React app runs as an ES module. Open the browser console for logs.'),
        React.createElement('p', { style: { fontSize: 12, color: '#666' } }, 'Tip: Serve this folder with a local static server (python -m http.server or npx http-server) to avoid cross-origin module issues.')
    );
}

async function mount() {
    try {
        const rootEl = document.getElementById('root');
        if (!rootEl) {
            const warning = document.createElement('div');
            warning.textContent = 'Error: Root element (#root) not found. Please add <div id="root"></div> to your HTML.';
            warning.style.cssText = 'padding:20px;font-family:Arial;color:#b22222;background:#fff3f3;border-left:4px solid #b22222;margin:16px;';
            (document.body || document.getElementsByTagName('body')[0]).appendChild(warning);
            console.error('Root element (#root) not found in the HTML.');
            return;
        }

        createRoot(rootEl).render(React.createElement(React.StrictMode, null, React.createElement(App)));
        console.log('✅ REACT/DAY-02 mounted successfully');
    } catch (err) {
        const msg = document.createElement('pre');
        msg.textContent = 'Failed to mount React app:\n' + (err && err.stack ? err.stack : String(err));
        msg.style.cssText = 'white-space:pre-wrap;padding:12px;margin:16px;background:#fff3f3;color:#b22222;border-left:4px solid #b22222;font-family:monospace;';
        (document.body || document.getElementsByTagName('body')[0]).appendChild(msg);
        console.error('Failed to mount React app', err);
    }
}

// Run the mount on module load
mount();

export default App;
