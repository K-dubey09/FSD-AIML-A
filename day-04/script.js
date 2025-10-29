async function myFunction() {
    try {
        clearScreen();
        writeLine('Starting sequence...', 'info');
        let result1 = await function1();
        let result2 = await function2(result1);
        let result3 = await function3(result2);
        writeLine('All steps completed ✓', 'ok');
        return result3;
    } catch (error) {
        console.error(error);
        writeLine('Error: ' + (error && error.message ? error.message : error), 'error');
        throw error;
    }
}

async function function1() {
    return new Promise((resolve, reject) => {
        writeLine('function1: starting...', 'small');
        setTimeout(() => {
            writeLine('done! function 1', 'ok');
            resolve('done!');
        }, 1200);

    });

}

async function function2(result) {
    return new Promise((resolve, reject) => {
        writeLine('function2: received → ' + String(result), 'small');
        if (result === 'done!') {
            setTimeout(() => {
                writeLine('done! function 2', 'ok');
                resolve('done! again');
            }, 1000);
        } else {
            reject(new Error('function2 failed'));
        }
    });
}

async function function3(result) {
    return new Promise((resolve, reject) => {
        writeLine('function3: received → ' + String(result), 'small');
        if (result === 'done! again') {
            setTimeout(() => {
                writeLine('done! function 3', 'ok');
                resolve('done! again again');
            }, 1000);
        } else {
            reject(new Error('function3 failed'));
        }
    });
}

// Small UI helpers to write into the black screen
function getScreen() {
    return document.getElementById('screen');
}

// default code shown in the editable area - shows the actual functions from this file
const defaultCode = `async function myFunction() {
    try {
        console.log('Starting sequence...');
        let result1 = await function1();
        let result2 = await function2(result1);
        let result3 = await function3(result2);
        console.log('All steps completed ✓');
        return result3;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function function1() {
    return new Promise((resolve, reject) => {
        console.log('function1: starting...');
        setTimeout(() => {
            console.log('done! function 1');
            resolve('done!');
        }, 1200);
    });
}

async function function2(result) {
    return new Promise((resolve, reject) => {
        console.log('function2: received → ' + String(result));
        if (result === 'done!') {
            setTimeout(() => {
                console.log('done! function 2');
                resolve('done! again');
            }, 1000);
        } else {
            reject(new Error('function2 failed'));
        }
    });
}

async function function3(result) {
    return new Promise((resolve, reject) => {
        console.log('function3: received → ' + String(result));
        if (result === 'done! again') {
            setTimeout(() => {
                console.log('done! function 3');
                resolve('done! again again');
            }, 1000);
        } else {
            reject(new Error('function3 failed'));
        }
    });
}

// Execute the sequence
myFunction();`;
// logs collected for export
const _logs = [];

// helper: escape HTML
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// basic code highlighter for printed code (very small): highlights keywords
function highlightCodeLine(line){
    const kw = ['async','await','function','const','let','var','return','new','throw','if','else','for','while','await','class'];
    let out = esc(line);
    // simple word boundary replace
    kw.forEach(k => {
        const re = new RegExp('\\b'+k+'\\b','g');
        out = out.replace(re, `<span class="kw">${k}</span>`);
    });
    // numbers
    out = out.replace(/(\b\d+\b)/g, '<span class="num">$1</span>');
    return out;
}

// write a line with optional typewriter animation, returns a Promise that resolves when shown
function writeLine(text, kind = 'info', {typewrite=true} = {}){
    const screen = getScreen();
    const tsOn = document.getElementById('tsToggle')?.checked;
    const typeSpeed = Number(document.getElementById('typeSpeed')?.value || 24);
    if (!screen) { console.log(text); return Promise.resolve(); }
    const el = document.createElement('div');
    el.className = 'line ' + (kind || 'info');
    // if this line is code (kind === 'small' and looks like code) apply highlighting when printing
    const isCodeLike = typeof text === 'string' && /[;{}()=]/.test(text);
    let content = text;
    if (tsOn) {
        const now = new Date();
        const stamp = now.toLocaleTimeString();
        content = `[${stamp}] ${content}`;
    }
    // store log
    _logs.push({ts: Date.now(), kind, text: content});
    screen.appendChild(el);
    
    // Instant display without animation
    if (isCodeLike) el.innerHTML = highlightCodeLine(content);
    else el.textContent = content;
    el.classList.add('show');
    screen.scrollTop = screen.scrollHeight;
}

function clearScreen() {
    const screen = getScreen();
    if (screen) screen.innerHTML = '';
}

// attach click handler if present (safe): the page may also attach elsewhere
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('fetchBtn');
    const reset = document.getElementById('resetBtn');
    const editor = document.getElementById('editor');
    const exportBtn = document.getElementById('exportBtn');
    const typeSpeedInput = document.getElementById('typeSpeed');
    const lineDelayInput = document.getElementById('lineDelay');
    const tsToggle = document.getElementById('tsToggle');

    // populate editor with saved content or default on load
    const saved = localStorage.getItem('day04_editor');
    if (editor) {
        editor.setAttribute('data-placeholder', 'Edit code here...');
        editor.textContent = saved ? saved : defaultCode;
        editor.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace";
        editor.style.fontSize = '13px';
        editor.style.padding = '12px';
        // save on input (debounced)
        let t;
        editor.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => {
                localStorage.setItem('day04_editor', editor.textContent);
            }, 400);
        });
    }

        if (reset) {
                reset.addEventListener('click', () => {
                        if (editor) {
                                editor.textContent = defaultCode;
                                localStorage.removeItem('day04_editor');
                        }
                        clearScreen(); // Clear output screen when resetting
                        _logs.length = 0; // Clear logs array
                });
        }

        // create sandboxed iframe runner
        const runnerFrame = document.createElement('iframe');
        runnerFrame.style.display = 'none';
        runnerFrame.sandbox = 'allow-scripts';
        runnerFrame.srcdoc = `<!doctype html><html><body><script>
        // intercept console and run incoming code, posting messages to parent
        (function(){
            function post(type, payload){ try{ parent.postMessage(Object.assign({type:type}, payload), '*'); }catch(e){}
            }
            function stringify(v){ try{ return JSON.stringify(v); }catch(e){ return String(v); } }
            ['log','info','warn','error','debug'].forEach(fn => {
                const orig = console[fn] && console[fn].bind(console) || console.log.bind(console);
                console[fn] = function(){ orig.apply(this, arguments); try{ parent.postMessage({type:fn, message: Array.from(arguments).map(a=>{try{return typeof a==='object'?stringify(a):String(a)}catch(e){return String(a)}}).join(' ')}, '*'); }catch(e){} };
            });

            window.addEventListener('message', async (ev)=>{
                if (!ev.data || ev.data.type !== 'exec') return;
                try {
                    const code = ev.data.code || '';
                    // execute inside an async function wrapper so await works
                    const asyncWrapper = '(async function(){ try{ ' + code.replace(/`/g,'\\`') + ' } catch(e){ throw e; } })()';
                    const res = eval(asyncWrapper);
                    if (res && typeof res.then === 'function') {
                        res.then(r => {
                            parent.postMessage({type:'result', value: (r===undefined?null: (typeof r==='object'?stringify(r):String(r)))}, '*');
                            parent.postMessage({type:'done'}, '*');
                        }).catch(err => {
                            parent.postMessage({type:'error', message: err && err.stack ? err.stack : String(err)}, '*');
                        });
                    } else {
                        parent.postMessage({type:'result', value: (res===undefined?null: (typeof res==='object'?stringify(res):String(res)))}, '*');
                        parent.postMessage({type:'done'}, '*');
                    }
                } catch (err) {
                    parent.postMessage({type:'error', message: err && err.stack ? err.stack : String(err)}, '*');
                }
            }, false);
        })();
        <\/script></body></html>`;
        document.body.appendChild(runnerFrame);

    // handle messages from runner
    window.addEventListener('message', (ev)=>{
        const d = ev.data || {};
        if (d.type === 'log' || d.type === 'info') writeLine(String(d.message), 'info');
        else if (d.type === 'warn') writeLine(String(d.message), 'small');
        else if (d.type === 'debug') writeLine(String(d.message), 'small');
        else if (d.type === 'error') writeLine('Runner error: ' + String(d.message), 'error');
        else if (d.type === 'result') writeLine('Result: ' + String(d.value), 'ok');
        else if (d.type === 'done') writeLine('Runner finished', 'ok');
    });

        // export log
        if (exportBtn) exportBtn.addEventListener('click', ()=>{
                const lines = _logs.map(l => `${new Date(l.ts).toLocaleString()} [${l.kind}] ${l.text}`).join('\n');
                const blob = new Blob([lines], {type:'text/plain;charset=utf-8'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'output-log.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        });

    if (btn) {
        btn.addEventListener('click', () => {
            clearScreen();
            // Show loading indicator
            writeLine('⏳ Executing code...', 'info');
            
            if (editor) {
                const code = editor.textContent || '';
                // Print code to output instantly
                writeLine('--- Code ---', 'info');
                const lines = code.split('\n');
                lines.forEach(line => writeLine(line, 'small'));
                writeLine('--- Output ---', 'info');

                // send code to sandbox to execute (runner iframe)
                runnerFrame.contentWindow.postMessage({type:'exec', code}, '*');
            }
        });
    }
    
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
