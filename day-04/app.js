// Default async/await example code
const defaultCode = `// Async/Await & Promise Examples

async function fetchUserData() {
    console.log('🔍 Fetching user data...');
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = { id: 1, name: 'Alice', role: 'Developer' };
            console.log('✅ User data received:', user);
            resolve(user);
        }, 1000);
    });
}

async function fetchUserPosts(userId) {
    console.log('📝 Fetching posts for user ' + userId + '...');
    return new Promise((resolve) => {
        setTimeout(() => {
            const posts = ['Post 1: Hello World', 'Post 2: Async is awesome'];
            console.log('✅ Found ' + posts.length + ' posts');
            resolve(posts);
        }, 800);
    });
}

async function processData() {
    try {
        console.log('🚀 Starting data processing...');
        
        const user = await fetchUserData();
        console.log('👤 Processing user: ' + user.name);
        
        const posts = await fetchUserPosts(user.id);
        posts.forEach((post, i) => console.log('  ' + (i + 1) + '. ' + post));
        
        console.log('✨ All operations completed successfully!');
        return { user, posts };
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Run the async function
processData();`;

const _logs = [];
const _persistentLogs = []; // Persistent logs for the logs section

function esc(s) { 
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
}

function highlightCodeLine(line) {
    const kw = ['async', 'await', 'function', 'const', 'let', 'var', 'return', 'new', 'throw', 'if', 'else', 'for', 'while', 'class', 'try', 'catch'];
    let out = esc(line);
    kw.forEach(k => {
        const re = new RegExp('\\b' + k + '\\b', 'g');
        out = out.replace(re, '<span class="kw">' + k + '</span>');
    });
    out = out.replace(/(\b\d+\b)/g, '<span class="num">$1</span>');
    return out;
}

function getScreen() {
    return document.getElementById('screen');
}

function writeLine(text, kind) {
    kind = kind || 'info';
    const screen = getScreen();
    const tsOn = document.getElementById('tsToggle') && document.getElementById('tsToggle').checked;
    if (!screen) { 
        console.log(text); 
        return; 
    }
    
    const el = document.createElement('div');
    el.className = 'line ' + kind;
    
    const isCodeLike = typeof text === 'string' && /[;{}()=]/.test(text);
    let content = text;
    
    if (tsOn) {
        const now = new Date();
        const stamp = now.toLocaleTimeString();
        content = '[' + stamp + '] ' + content;
    }
    
    _logs.push({ ts: Date.now(), kind: kind, text: content });
    screen.appendChild(el);
    
    if (isCodeLike) {
        el.innerHTML = highlightCodeLine(content);
    } else {
        el.textContent = content;
    }
    el.classList.add('show');
    screen.scrollTop = screen.scrollHeight;
}

function clearScreen() {
    const screen = getScreen();
    if (screen) screen.innerHTML = '';
}

function addLogEntry(text, kind) {
    kind = kind || 'info';
    const logsContainer = document.getElementById('logs');
    const logCount = document.getElementById('logCount');
    if (!logsContainer) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const timestamp = now.toISOString();
    
    // Store in persistent logs array
    _persistentLogs.push({
        time: timestamp,
        text: text,
        kind: kind,
        timeStr: timeStr
    });
    
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + kind;
    
    entry.innerHTML = '<div class="log-text">' + esc(text) + '</div><div class="log-time">' + timeStr + '</div>';
    
    logsContainer.appendChild(entry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
    
    const count = logsContainer.children.length;
    if (logCount) logCount.textContent = count + (count === 1 ? ' entry' : ' entries');
}

function clearLogs() {
    const logsContainer = document.getElementById('logs');
    const logCount = document.getElementById('logCount');
    if (logsContainer) logsContainer.innerHTML = '';
    if (logCount) logCount.textContent = '0 entries';
}

function updateStatus(status, color) {
    color = color || '#4f46e5';
    const badge = document.getElementById('statusBadge');
    if (badge) {
        badge.textContent = status;
        if (color === '#4f46e5') badge.style.background = '#e0e7ff';
        else if (color === '#16a34a') badge.style.background = '#dcfce7';
        else if (color === '#dc2626') badge.style.background = '#fee2e2';
        else badge.style.background = '#e0e7ff';
        badge.style.color = color;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('runBtn');
    const reset = document.getElementById('resetBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const copyBtn = document.getElementById('copyBtn');
    const formatBtn = document.getElementById('formatBtn');
    const themeBtn = document.getElementById('themeBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    const editor = document.getElementById('editor');
    const exportBtn = document.getElementById('exportBtn');

    console.log('Page loaded, initializing editor...');

    const saved = localStorage.getItem('day04_editor');
    if (editor) {
        editor.setAttribute('data-placeholder', 'Type your async/await code here...');
        editor.textContent = saved || defaultCode;
        console.log('Editor initialized');
        
        setTimeout(function() { editor.focus(); }, 100);
        
        let t;
        editor.addEventListener('input', function() {
            clearTimeout(t);
            t = setTimeout(function() {
                localStorage.setItem('day04_editor', editor.textContent);
            }, 400);
        });
    }

    if (reset) {
        reset.addEventListener('click', function() {
            console.log('Reset clicked');
            if (editor) {
                editor.textContent = defaultCode;
                localStorage.removeItem('day04_editor');
                editor.focus();
            }
            clearScreen();
            _logs.length = 0;
            updateStatus('Ready', '#4f46e5');
            addLogEntry('Editor reset → default code restored', 'info');
            addLogEntry('Editor reset to default code', 'info');
        });
    }
    
    if (clearOutputBtn) {
        clearOutputBtn.addEventListener('click', function() {
            console.log('Clear Output clicked');
            clearScreen();
            _logs.length = 0;
            updateStatus('Ready', '#4f46e5');
            addLogEntry('Output console cleared', 'info');
        });
    }
    
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', function() {
            console.log('Clear Logs clicked');
            clearLogs();
        });
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            console.log('Copy clicked');
            if (editor && navigator.clipboard) {
                navigator.clipboard.writeText(editor.textContent).then(function() {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = '✓ Copied!';
                    setTimeout(function() { copyBtn.textContent = originalText; }, 2000);
                    var lines = (editor.textContent || '').split('\n').length;
                    addLogEntry('Code copied → ' + lines + ' lines to clipboard', 'ok');
                }).catch(function(err) {
                    console.error('Copy failed:', err);
                    addLogEntry('Copy failed → clipboard error', 'error');
                });
            }
        });
    }
    
    if (formatBtn) {
        formatBtn.addEventListener('click', function() {
            console.log('Format clicked');
            if (editor) {
                let code = editor.textContent;
                code = code.trim();
                editor.textContent = code;
                localStorage.setItem('day04_editor', code);
                addLogEntry('Code formatted → whitespace trimmed', 'info');
            }
        });
    }
    
    if (themeBtn) {
        const savedTheme = localStorage.getItem('day04_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeBtn.textContent = '☀️ Light Mode';
        }
        
        themeBtn.addEventListener('click', function() {
            console.log('Theme clicked');
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            localStorage.setItem('day04_theme', isDark ? 'dark' : 'light');
            addLogEntry('Theme changed → ' + (isDark ? 'dark' : 'light') + ' mode enabled', 'info');
            addLogEntry('Switched to ' + (isDark ? 'dark' : 'light') + ' mode', 'info');
        });
    }

    const runnerFrame = document.createElement('iframe');
    runnerFrame.style.display = 'none';
    runnerFrame.sandbox = 'allow-scripts';
    runnerFrame.srcdoc = '<!doctype html><html><body><script>(function(){function post(type,payload){try{parent.postMessage(Object.assign({type:type},payload),"*")}catch(e){}}function stringify(v){try{return JSON.stringify(v)}catch(e){return String(v)}}["log","info","warn","error","debug"].forEach(function(fn){var orig=console[fn]&&console[fn].bind(console)||console.log.bind(console);console[fn]=function(){orig.apply(this,arguments);try{var message=Array.from(arguments).map(function(a){try{return typeof a==="object"?stringify(a):String(a)}catch(e){return String(a)}}).join(" ");parent.postMessage({type:fn,message:message},"*")}catch(e){}}});window.addEventListener("message",async function(ev){if(!ev.data||ev.data.type!=="exec")return;try{var code=ev.data.code||"";console.log("Executing code...");var asyncWrapper="(async function(){ "+code+" })()";var res=eval(asyncWrapper);if(res&&typeof res.then==="function"){res.then(function(r){var val=r===undefined?"undefined":typeof r==="object"?stringify(r):String(r);parent.postMessage({type:"result",value:val},"*");parent.postMessage({type:"done"},"*")}).catch(function(err){parent.postMessage({type:"error",message:err&&err.stack?err.stack:String(err)},"*")})}else{var val=res===undefined?"undefined":typeof res==="object"?stringify(res):String(res);parent.postMessage({type:"result",value:val},"*");parent.postMessage({type:"done"},"*")}}catch(err){parent.postMessage({type:"error",message:err&&err.stack?err.stack:String(err)},"*")}},false)})();<\/script></body></html>';
    
    document.body.appendChild(runnerFrame);
    console.log('Sandbox iframe created');

    window.addEventListener('message', function(ev) {
        const d = ev.data || {};
        
        if (d.type === 'log' || d.type === 'info') {
            writeLine(String(d.message), 'info');
        }
        else if (d.type === 'warn') {
            writeLine('⚠️ ' + String(d.message), 'small');
        }
        else if (d.type === 'debug') {
            writeLine('🐛 ' + String(d.message), 'small');
        }
        else if (d.type === 'error') {
            writeLine('❌ Error: ' + String(d.message), 'error');
            addLogEntry('Execution error → ' + String(d.message), 'error');
            updateStatus('Error', '#dc2626');
        }
        else if (d.type === 'result') {
            if (String(d.value) !== 'undefined') {
                writeLine('↪️ Result: ' + String(d.value), 'ok');
            }
        }
        else if (d.type === 'done') {
            writeLine('✅ Execution completed', 'ok');
            var outputLines = document.querySelectorAll('.output-line').length;
            addLogEntry('Code executed → ' + outputLines + ' console outputs, completed successfully', 'ok');
            updateStatus('Completed', '#16a34a');
        }
    });

    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('Export clicked');
            const lines = _logs.map(function(l) {
                return new Date(l.ts).toLocaleString() + ' [' + l.kind + '] ' + l.text;
            }).join('\n');
            const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'output-log-' + new Date().toISOString().slice(0, 10) + '.txt';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            addLogEntry('Logs exported → file downloaded', 'ok');
        });
    }

    if (btn) {
        btn.addEventListener('click', function() {
            console.log('Run clicked');
            clearScreen();
            updateStatus('Running...', '#f59e0b');
            
            writeLine('🚀 Executing code...', 'info');
            writeLine('', 'small');
            
            if (editor) {
                const code = editor.textContent || '';
                
                if (!code.trim()) {
                    writeLine('⚠️ No code to execute', 'error');
                    updateStatus('Ready', '#4f46e5');
                    addLogEntry('No code to run → editor is empty', 'error');
                    return;
                }

                setTimeout(function() {
                    runnerFrame.contentWindow.postMessage({ type: 'exec', code: code }, '*');
                }, 100);
            }
        });
    }
    
    if (editor) {
        editor.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                console.log('Ctrl+Enter pressed');
                if (btn) btn.click();
            }
        });
    }

    addLogEntry('Editor ready - Press Ctrl+Enter or click Run Code to execute', 'info');
    console.log('All event listeners initialized');
});
