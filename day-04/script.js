// Default code shown in the editable area - async/await promise examplesasync function myFunction() {

const defaultCode = `// Async/Await & Promise Examples    try {

        clearScreen();

async function fetchUserData() {        writeLine('Starting sequence...', 'info');

    console.log('🔍 Fetching user data...');        let result1 = await function1();

    return new Promise((resolve) => {        let result2 = await function2(result1);

        setTimeout(() => {        let result3 = await function3(result2);

            const user = { id: 1, name: 'Alice', role: 'Developer' };        writeLine('All steps completed ✓', 'ok');

            console.log('✅ User data received:', user);        return result3;

            resolve(user);    } catch (error) {

        }, 1000);        console.error(error);

    });        writeLine('Error: ' + (error && error.message ? error.message : error), 'error');

}        throw error;

    }

async function fetchUserPosts(userId) {}

    console.log(\`📝 Fetching posts for user \${userId}...\`);

    return new Promise((resolve) => {async function function1() {

        setTimeout(() => {    return new Promise((resolve, reject) => {

            const posts = ['Post 1: Hello World', 'Post 2: Async is awesome'];        writeLine('function1: starting...', 'small');

            console.log(\`✅ Found \${posts.length} posts\`);        setTimeout(() => {

            resolve(posts);            writeLine('done! function 1', 'ok');

        }, 800);            resolve('done!');

    });        }, 1200);

}

    });

async function processData() {

    try {}

        console.log('🚀 Starting data processing...');

        async function function2(result) {

        const user = await fetchUserData();    return new Promise((resolve, reject) => {

        console.log(\`👤 Processing user: \${user.name}\`);        writeLine('function2: received → ' + String(result), 'small');

                if (result === 'done!') {

        const posts = await fetchUserPosts(user.id);            setTimeout(() => {

        posts.forEach((post, i) => console.log(\`  \${i + 1}. \${post}\`));                writeLine('done! function 2', 'ok');

                        resolve('done! again');

        console.log('✨ All operations completed successfully!');            }, 1000);

        return { user, posts };        } else {

    } catch (error) {            reject(new Error('function2 failed'));

        console.error('❌ Error:', error.message);        }

        throw error;    });

    }}

}

async function function3(result) {

// Run the async function    return new Promise((resolve, reject) => {

processData();`;        writeLine('function3: received → ' + String(result), 'small');

        if (result === 'done! again') {

// Logs collected for export            setTimeout(() => {

const _logs = [];                writeLine('done! function 3', 'ok');

                resolve('done! again again');

// Helper: escape HTML            }, 1000);

function esc(s) {         } else {

    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');             reject(new Error('function3 failed'));

}        }

    });

// Basic code highlighter for printed code}

function highlightCodeLine(line) {

    const kw = ['async', 'await', 'function', 'const', 'let', 'var', 'return', 'new', 'throw', 'if', 'else', 'for', 'while', 'class', 'try', 'catch'];// Small UI helpers to write into the black screen

    let out = esc(line);function getScreen() {

    kw.forEach(k => {    return document.getElementById('screen');

        const re = new RegExp('\\b' + k + '\\b', 'g');}

        out = out.replace(re, `<span class="kw">${k}</span>`);

    });// default code shown in the editable area - async/await promise examples

    out = out.replace(/(\b\d+\b)/g, '<span class="num">$1</span>');const defaultCode = `// Async/Await & Promise Examples

    return out;

}async function fetchUserData() {

    console.log('🔍 Fetching user data...');

// Get screen element    return new Promise((resolve) => {

function getScreen() {        setTimeout(() => {

    return document.getElementById('screen');            const user = { id: 1, name: 'Alice', role: 'Developer' };

}            console.log('✅ User data received:', user);

            resolve(user);

// Write a line to the output screen        }, 1000);

function writeLine(text, kind = 'info') {    });

    const screen = getScreen();}

    const tsOn = document.getElementById('tsToggle')?.checked;

    if (!screen) { async function fetchUserPosts(userId) {

        console.log(text);     console.log(\`📝 Fetching posts for user \${userId}...\`);

        return;     return new Promise((resolve) => {

    }        setTimeout(() => {

                const posts = ['Post 1: Hello World', 'Post 2: Async is awesome'];

    const el = document.createElement('div');            console.log(\`✅ Found \${posts.length} posts\`);

    el.className = 'line ' + (kind || 'info');            resolve(posts);

            }, 800);

    const isCodeLike = typeof text === 'string' && /[;{}()=]/.test(text);    });

    let content = text;}

    

    if (tsOn) {async function processData() {

        const now = new Date();    try {

        const stamp = now.toLocaleTimeString();        console.log('🚀 Starting data processing...');

        content = `[${stamp}] ${content}`;        

    }        const user = await fetchUserData();

            console.log(\`👤 Processing user: \${user.name}\`);

    // Store log        

    _logs.push({ ts: Date.now(), kind, text: content });        const posts = await fetchUserPosts(user.id);

    screen.appendChild(el);        posts.forEach((post, i) => console.log(\`  \${i + 1}. \${post}\`));

            

    // Instant display without animation        console.log('✨ All operations completed successfully!');

    if (isCodeLike) {        return { user, posts };

        el.innerHTML = highlightCodeLine(content);    } catch (error) {

    } else {        console.error('❌ Error:', error.message);

        el.textContent = content;        throw error;

    }    }

    el.classList.add('show');}

    screen.scrollTop = screen.scrollHeight;

}// Run the async function

processData();

// Clear the output screen            resolve('done!');

function clearScreen() {        }, 1200);

    const screen = getScreen();    });

    if (screen) screen.innerHTML = '';}

}

async function function2(result) {

// Add log entry to logs section    return new Promise((resolve, reject) => {

function addLogEntry(text, kind = 'info') {        console.log('function2: received → ' + String(result));

    const logsContainer = document.getElementById('logs');        if (result === 'done!') {

    const logCount = document.getElementById('logCount');            setTimeout(() => {

    if (!logsContainer) return;                console.log('done! function 2');

                    resolve('done! again');

    const entry = document.createElement('div');            }, 1000);

    entry.className = `log-entry ${kind}`;        } else {

                reject(new Error('function2 failed'));

    const now = new Date();        }

    const timeStr = now.toLocaleTimeString();    });

    }

    entry.innerHTML = `

        <div class="log-text">${esc(text)}</div>async function function3(result) {

        <div class="log-time">${timeStr}</div>    return new Promise((resolve, reject) => {

    `;        console.log('function3: received → ' + String(result));

            if (result === 'done! again') {

    logsContainer.appendChild(entry);            setTimeout(() => {

    logsContainer.scrollTop = logsContainer.scrollHeight;                console.log('done! function 3');

                    resolve('done! again again');

    // Update count            }, 1000);

    const count = logsContainer.children.length;        } else {

    if (logCount) logCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;            reject(new Error('function3 failed'));

}        }

    });

// Clear logs section}

function clearLogs() {

    const logsContainer = document.getElementById('logs');// Execute the sequence

    const logCount = document.getElementById('logCount');myFunction();`;

    if (logsContainer) logsContainer.innerHTML = '';// logs collected for export

    if (logCount) logCount.textContent = '0 entries';const _logs = [];

}

// helper: escape HTML

// Update status badgefunction esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function updateStatus(status, color = '#4f46e5') {

    const badge = document.getElementById('statusBadge');// basic code highlighter for printed code (very small): highlights keywords

    if (badge) {function highlightCodeLine(line){

        badge.textContent = status;    const kw = ['async','await','function','const','let','var','return','new','throw','if','else','for','while','await','class'];

        badge.style.background = color === '#4f46e5' ? '#e0e7ff' :     let out = esc(line);

                                 color === '#16a34a' ? '#dcfce7' :     // simple word boundary replace

                                 color === '#dc2626' ? '#fee2e2' : '#e0e7ff';    kw.forEach(k => {

        badge.style.color = color;        const re = new RegExp('\\b'+k+'\\b','g');

    }        out = out.replace(re, `<span class="kw">${k}</span>`);

}    });

    // numbers

// Main initialization    out = out.replace(/(\b\d+\b)/g, '<span class="num">$1</span>');

document.addEventListener('DOMContentLoaded', () => {    return out;

    const btn = document.getElementById('runBtn');}

    const reset = document.getElementById('resetBtn');

    const clearOutputBtn = document.getElementById('clearOutputBtn');// write a line with optional typewriter animation, returns a Promise that resolves when shown

    const copyBtn = document.getElementById('copyBtn');function writeLine(text, kind = 'info', {typewrite=true} = {}){

    const formatBtn = document.getElementById('formatBtn');    const screen = getScreen();

    const themeBtn = document.getElementById('themeBtn');    const tsOn = document.getElementById('tsToggle')?.checked;

    const clearLogsBtn = document.getElementById('clearLogsBtn');    const typeSpeed = Number(document.getElementById('typeSpeed')?.value || 24);

    const editor = document.getElementById('editor');    if (!screen) { console.log(text); return Promise.resolve(); }

    const exportBtn = document.getElementById('exportBtn');    const el = document.createElement('div');

    const tsToggle = document.getElementById('tsToggle');    el.className = 'line ' + (kind || 'info');

    // if this line is code (kind === 'small' and looks like code) apply highlighting when printing

    console.log('Page loaded, initializing editor...');    const isCodeLike = typeof text === 'string' && /[;{}()=]/.test(text);

    let content = text;

    // Populate editor with saved content or default on load    if (tsOn) {

    const saved = localStorage.getItem('day04_editor');        const now = new Date();

    if (editor) {        const stamp = now.toLocaleTimeString();

        editor.setAttribute('data-placeholder', 'Type your async/await code here...');        content = `[${stamp}] ${content}`;

        editor.textContent = saved || defaultCode;    }

        console.log('Editor initialized with', saved ? 'saved' : 'default', 'code');    // store log

            _logs.push({ts: Date.now(), kind, text: content});

        // Auto-focus editor on load    screen.appendChild(el);

        setTimeout(() => editor.focus(), 100);    

            // Instant display without animation

        // Save on input (debounced)    if (isCodeLike) el.innerHTML = highlightCodeLine(content);

        let t;    else el.textContent = content;

        editor.addEventListener('input', () => {    el.classList.add('show');

            clearTimeout(t);    screen.scrollTop = screen.scrollHeight;

            t = setTimeout(() => {}

                localStorage.setItem('day04_editor', editor.textContent);

                console.log('Code auto-saved');function clearScreen() {

            }, 400);    const screen = getScreen();

        });    if (screen) screen.innerHTML = '';

    }}



    // Reset button// attach click handler if present (safe): the page may also attach elsewhere

    if (reset) {// Logs display helper

        reset.addEventListener('click', () => {function addLogEntry(text, kind = 'info') {

            console.log('Reset button clicked');    const logsContainer = document.getElementById('logs');

            if (editor) {    const logCount = document.getElementById('logCount');

                editor.textContent = defaultCode;    if (!logsContainer) return;

                localStorage.removeItem('day04_editor');    

                editor.focus();    const entry = document.createElement('div');

            }    entry.className = `log-entry ${kind}`;

            clearScreen();    

            clearLogs();    const now = new Date();

            _logs.length = 0;    const timeStr = now.toLocaleTimeString();

            updateStatus('Ready', '#4f46e5');    

            addLogEntry('Editor reset to default code', 'info');    entry.innerHTML = `

        });        <div class="log-text">${esc(text)}</div>

    }        <div class="log-time">${timeStr}</div>

        `;

    // Clear Output button    

    if (clearOutputBtn) {    logsContainer.appendChild(entry);

        clearOutputBtn.addEventListener('click', () => {    logsContainer.scrollTop = logsContainer.scrollHeight;

            console.log('Clear Output button clicked');    

            clearScreen();    // Update count

            _logs.length = 0;    const count = logsContainer.children.length;

            updateStatus('Ready', '#4f46e5');    if (logCount) logCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;

            addLogEntry('Output cleared', 'info');}

        });

    }function clearLogs() {

        const logsContainer = document.getElementById('logs');

    // Clear Logs button    const logCount = document.getElementById('logCount');

    if (clearLogsBtn) {    if (logsContainer) logsContainer.innerHTML = '';

        clearLogsBtn.addEventListener('click', () => {    if (logCount) logCount.textContent = '0 entries';

            console.log('Clear Logs button clicked');}

            clearLogs();

        });function updateStatus(status, color = '#4f46e5') {

    }    const badge = document.getElementById('statusBadge');

        if (badge) {

    // Copy Code button        badge.textContent = status;

    if (copyBtn) {        badge.style.background = color === '#4f46e5' ? '#e0e7ff' : 

        copyBtn.addEventListener('click', async () => {                                 color === '#16a34a' ? '#dcfce7' : 

            console.log('Copy Code button clicked');                                 color === '#dc2626' ? '#fee2e2' : '#e0e7ff';

            if (editor) {        badge.style.color = color;

                try {    }

                    await navigator.clipboard.writeText(editor.textContent);}

                    const originalText = copyBtn.textContent;

                    copyBtn.textContent = '✓ Copied!';document.addEventListener('DOMContentLoaded', () => {

                    setTimeout(() => { copyBtn.textContent = originalText; }, 2000);    const btn = document.getElementById('runBtn');

                    addLogEntry('Code copied to clipboard', 'ok');    const reset = document.getElementById('resetBtn');

                } catch (err) {    const clearOutputBtn = document.getElementById('clearOutputBtn');

                    console.error('Copy failed:', err);    const copyBtn = document.getElementById('copyBtn');

                    addLogEntry('Failed to copy code: ' + err.message, 'error');    const formatBtn = document.getElementById('formatBtn');

                }    const themeBtn = document.getElementById('themeBtn');

            }    const clearLogsBtn = document.getElementById('clearLogsBtn');

        });    const editor = document.getElementById('editor');

    }    const exportBtn = document.getElementById('exportBtn');

        const tsToggle = document.getElementById('tsToggle');

    // Format Code button

    if (formatBtn) {    // populate editor with saved content or default on load

        formatBtn.addEventListener('click', () => {    const saved = localStorage.getItem('day04_editor');

            console.log('Format button clicked');    if (editor) {

            if (editor) {        editor.setAttribute('data-placeholder', 'Type your async/await code here...');

                let code = editor.textContent;        editor.textContent = saved ? saved : defaultCode;

                code = code.trim();        // Auto-focus editor on load

                editor.textContent = code;        setTimeout(() => editor.focus(), 100);

                localStorage.setItem('day04_editor', code);        // save on input (debounced)

                addLogEntry('Code formatted', 'info');        let t;

            }        editor.addEventListener('input', () => {

        });            clearTimeout(t);

    }            t = setTimeout(() => {

                    localStorage.setItem('day04_editor', editor.textContent);

    // Theme Toggle button            }, 400);

    if (themeBtn) {        });

        const savedTheme = localStorage.getItem('day04_theme');    }

        if (savedTheme === 'dark') {

            document.body.classList.add('dark-mode');    // Reset button

            themeBtn.textContent = '☀️ Light Mode';    if (reset) {

        }        reset.addEventListener('click', () => {

                    if (editor) {

        themeBtn.addEventListener('click', () => {                editor.textContent = defaultCode;

            console.log('Theme button clicked');                localStorage.removeItem('day04_editor');

            document.body.classList.toggle('dark-mode');                editor.focus();

            const isDark = document.body.classList.contains('dark-mode');            }

            themeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';            clearScreen();

            localStorage.setItem('day04_theme', isDark ? 'dark' : 'light');            clearLogs();

            addLogEntry(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'info');            _logs.length = 0;

        });            updateStatus('Ready', '#4f46e5');

    }            addLogEntry('Editor reset to default code', 'info');

        });

    // Create sandboxed iframe runner    }

    const runnerFrame = document.createElement('iframe');    

    runnerFrame.style.display = 'none';    // Clear Output button

    runnerFrame.sandbox = 'allow-scripts';    if (clearOutputBtn) {

    runnerFrame.srcdoc = `<!doctype html><html><body><script>        clearOutputBtn.addEventListener('click', () => {

    (function(){            clearScreen();

        function post(type, payload){             _logs.length = 0;

            try{             updateStatus('Ready', '#4f46e5');

                parent.postMessage(Object.assign({type:type}, payload), '*');             addLogEntry('Output cleared', 'info');

            } catch(e) {        });

                console.error('Post message failed:', e);    }

            }    

        }    // Clear Logs button

            if (clearLogsBtn) {

        function stringify(v){         clearLogsBtn.addEventListener('click', () => {

            try{             clearLogs();

                return JSON.stringify(v);         });

            } catch(e) {     }

                return String(v);     

            }     // Copy Code button

        }    if (copyBtn) {

                copyBtn.addEventListener('click', async () => {

        // Intercept console methods            if (editor) {

        ['log','info','warn','error','debug'].forEach(fn => {                try {

            const orig = console[fn] && console[fn].bind(console) || console.log.bind(console);                    await navigator.clipboard.writeText(editor.textContent);

            console[fn] = function(){                     copyBtn.textContent = '✓ Copied!';

                orig.apply(this, arguments);                     setTimeout(() => { copyBtn.textContent = '📋 Copy Code'; }, 2000);

                try{                     addLogEntry('Code copied to clipboard', 'ok');

                    const message = Array.from(arguments).map(a => {                } catch (err) {

                        try {                    addLogEntry('Failed to copy code', 'error');

                            return typeof a === 'object' ? stringify(a) : String(a);                }

                        } catch(e) {            }

                            return String(a);        });

                        }    }

                    }).join(' ');    

                    parent.postMessage({type: fn, message: message}, '*');     // Format Code button (basic)

                } catch(e) {    if (formatBtn) {

                    console.error('Message post failed:', e);        formatBtn.addEventListener('click', () => {

                }             if (editor) {

            };                let code = editor.textContent;

        });                // Basic formatting: normalize line breaks and indentation

                code = code.trim();

        window.addEventListener('message', async (ev) => {                editor.textContent = code;

            if (!ev.data || ev.data.type !== 'exec') return;                localStorage.setItem('day04_editor', code);

                            addLogEntry('Code formatted', 'info');

            try {            }

                const code = ev.data.code || '';        });

                console.log('Executing code...');    }

                    

                // Execute inside an async function wrapper so await works    // Theme Toggle button

                const asyncWrapper = '(async function(){ ' + code + ' })()';    if (themeBtn) {

                const res = eval(asyncWrapper);        const savedTheme = localStorage.getItem('day04_theme');

                        if (savedTheme === 'dark') {

                if (res && typeof res.then === 'function') {            document.body.classList.add('dark-mode');

                    res.then(r => {            themeBtn.textContent = '☀️ Light Mode';

                        const val = r === undefined ? 'undefined' : (typeof r === 'object' ? stringify(r) : String(r));        }

                        parent.postMessage({type: 'result', value: val}, '*');        

                        parent.postMessage({type: 'done'}, '*');        themeBtn.addEventListener('click', () => {

                    }).catch(err => {            document.body.classList.toggle('dark-mode');

                        parent.postMessage({type: 'error', message: err && err.stack ? err.stack : String(err)}, '*');            const isDark = document.body.classList.contains('dark-mode');

                    });            themeBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';

                } else {            localStorage.setItem('day04_theme', isDark ? 'dark' : 'light');

                    const val = res === undefined ? 'undefined' : (typeof res === 'object' ? stringify(res) : String(res));            addLogEntry(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'info');

                    parent.postMessage({type: 'result', value: val}, '*');        });

                    parent.postMessage({type: 'done'}, '*');    }

                }

            } catch (err) {        // create sandboxed iframe runner

                parent.postMessage({type: 'error', message: err && err.stack ? err.stack : String(err)}, '*');        const runnerFrame = document.createElement('iframe');

            }        runnerFrame.style.display = 'none';

        }, false);        runnerFrame.sandbox = 'allow-scripts';

    })();        runnerFrame.srcdoc = `<!doctype html><html><body><script>

    <\/script></body></html>`;        // intercept console and run incoming code, posting messages to parent

            (function(){

    document.body.appendChild(runnerFrame);            function post(type, payload){ try{ parent.postMessage(Object.assign({type:type}, payload), '*'); }catch(e){}

    console.log('Sandbox iframe created');            }

            function stringify(v){ try{ return JSON.stringify(v); }catch(e){ return String(v); } }

    // Handle messages from runner            ['log','info','warn','error','debug'].forEach(fn => {

    window.addEventListener('message', (ev) => {                const orig = console[fn] && console[fn].bind(console) || console.log.bind(console);

        const d = ev.data || {};                console[fn] = function(){ orig.apply(this, arguments); try{ parent.postMessage({type:fn, message: Array.from(arguments).map(a=>{try{return typeof a==='object'?stringify(a):String(a)}catch(e){return String(a)}}).join(' ')}, '*'); }catch(e){} };

                    });

        if (d.type === 'log' || d.type === 'info') {

            writeLine(String(d.message), 'info');            window.addEventListener('message', async (ev)=>{

            addLogEntry(String(d.message), 'info');                if (!ev.data || ev.data.type !== 'exec') return;

        }                try {

        else if (d.type === 'warn') {                    const code = ev.data.code || '';

            writeLine('⚠️ ' + String(d.message), 'small');                    // execute inside an async function wrapper so await works

            addLogEntry('WARN: ' + String(d.message), 'info');                    const asyncWrapper = '(async function(){ try{ ' + code.replace(/`/g,'\\`') + ' } catch(e){ throw e; } })()';

        }                    const res = eval(asyncWrapper);

        else if (d.type === 'debug') {                    if (res && typeof res.then === 'function') {

            writeLine('🐛 ' + String(d.message), 'small');                        res.then(r => {

            addLogEntry('DEBUG: ' + String(d.message), 'info');                            parent.postMessage({type:'result', value: (r===undefined?null: (typeof r==='object'?stringify(r):String(r)))}, '*');

        }                            parent.postMessage({type:'done'}, '*');

        else if (d.type === 'error') {                        }).catch(err => {

            writeLine('❌ Error: ' + String(d.message), 'error');                            parent.postMessage({type:'error', message: err && err.stack ? err.stack : String(err)}, '*');

            addLogEntry('ERROR: ' + String(d.message), 'error');                        });

            updateStatus('Error', '#dc2626');                    } else {

        }                        parent.postMessage({type:'result', value: (res===undefined?null: (typeof res==='object'?stringify(res):String(res)))}, '*');

        else if (d.type === 'result') {                        parent.postMessage({type:'done'}, '*');

            if (String(d.value) !== 'undefined') {                    }

                writeLine('↪️ Result: ' + String(d.value), 'ok');                } catch (err) {

                addLogEntry('Returned: ' + String(d.value), 'ok');                    parent.postMessage({type:'error', message: err && err.stack ? err.stack : String(err)}, '*');

            }                }

        }            }, false);

        else if (d.type === 'done') {        })();

            writeLine('✅ Execution completed', 'ok');        <\/script></body></html>`;

            addLogEntry('Execution finished successfully', 'ok');        document.body.appendChild(runnerFrame);

            updateStatus('Completed', '#16a34a');

        }    // handle messages from runner

    });    window.addEventListener('message', (ev)=>{

        const d = ev.data || {};

    // Export log        if (d.type === 'log' || d.type === 'info') {

    if (exportBtn) {            writeLine(String(d.message), 'info');

        exportBtn.addEventListener('click', () => {            addLogEntry(String(d.message), 'info');

            console.log('Export button clicked');        }

            const lines = _logs.map(l => `${new Date(l.ts).toLocaleString()} [${l.kind}] ${l.text}`).join('\n');        else if (d.type === 'warn') {

            const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });            writeLine(String(d.message), 'small');

            const url = URL.createObjectURL(blob);            addLogEntry('WARN: ' + String(d.message), 'info');

            const a = document.createElement('a');        }

            a.href = url;        else if (d.type === 'debug') {

            a.download = 'output-log-' + new Date().toISOString().slice(0, 10) + '.txt';            writeLine(String(d.message), 'small');

            document.body.appendChild(a);            addLogEntry('DEBUG: ' + String(d.message), 'info');

            a.click();        }

            a.remove();        else if (d.type === 'error') {

            URL.revokeObjectURL(url);            writeLine('Error: ' + String(d.message), 'error');

            addLogEntry('Log exported successfully', 'ok');            addLogEntry('ERROR: ' + String(d.message), 'error');

        });            updateStatus('Error', '#dc2626');

    }        }

        else if (d.type === 'result') {

    // Run Code button            writeLine('Result: ' + String(d.value), 'ok');

    if (btn) {            addLogEntry('Returned: ' + String(d.value), 'ok');

        btn.addEventListener('click', () => {        }

            console.log('Run button clicked');        else if (d.type === 'done') {

            clearScreen();            writeLine('✅ Execution completed', 'ok');

            updateStatus('Running...', '#f59e0b');            addLogEntry('Execution finished successfully', 'ok');

            addLogEntry('Started code execution', 'info');            updateStatus('Completed', '#16a34a');

                    }

            writeLine('🚀 Executing code...', 'info');    });

            writeLine('', 'small');

                    // export log

            if (editor) {        if (exportBtn) exportBtn.addEventListener('click', ()=>{

                const code = editor.textContent || '';                const lines = _logs.map(l => `${new Date(l.ts).toLocaleString()} [${l.kind}] ${l.text}`).join('\n');

                                const blob = new Blob([lines], {type:'text/plain;charset=utf-8'});

                if (!code.trim()) {                const url = URL.createObjectURL(blob);

                    writeLine('⚠️ No code to execute', 'error');                const a = document.createElement('a'); a.href = url; a.download = 'output-log.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);

                    updateStatus('Ready', '#4f46e5');        });

                    addLogEntry('No code provided', 'error');

                    return;    if (btn) {

                }        btn.addEventListener('click', () => {

            clearScreen();

                // Send code to sandbox to execute            updateStatus('Running...', '#f59e0b');

                setTimeout(() => {            addLogEntry('Started code execution', 'info');

                    runnerFrame.contentWindow.postMessage({ type: 'exec', code }, '*');            

                }, 100);            // Show loading indicator

            }            writeLine('🚀 Executing code...', 'info');

        });            writeLine('', 'small');

    }            

                if (editor) {

    // Add keyboard shortcut: Ctrl+Enter to run code                const code = editor.textContent || '';

    if (editor) {                

        editor.addEventListener('keydown', (e) => {                if (!code.trim()) {

            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {                    writeLine('⚠️ No code to execute', 'error');

                e.preventDefault();                    updateStatus('Ready', '#4f46e5');

                console.log('Ctrl+Enter pressed');                    addLogEntry('No code provided', 'error');

                btn?.click();                    return;

            }                }

        });

    }                // send code to sandbox to execute (runner iframe)

                runnerFrame.contentWindow.postMessage({type:'exec', code}, '*');

    // Initial log            }

    addLogEntry('Editor ready - Press Ctrl+Enter or click Run Code to execute', 'info');        });

    console.log('All event listeners initialized');    }

});    

    // Add keyboard shortcut: Ctrl+Enter to run code
    if (editor) {
        editor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                btn?.click();
            }
        });
    }
});
