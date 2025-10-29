# ⚡ Async/Await Promise Editor

A beautiful, feature-rich JavaScript playground for learning and testing async/await operations with real-time execution and console output.

## ✨ Features

### 🎨 Beautiful UI
- Modern gradient purple theme
- Clean single-column layout
- Smooth animations and transitions
- Professional styling with rounded corners and shadows
- Dark mode support

### ✏️ Code Editor
- **Editable code area** with syntax highlighting
- **Auto-save** to localStorage (persists between sessions)
- **Default async/await examples** loaded on startup
- **Ctrl+Enter shortcut** to run code quickly
- Monospace font for better code readability

### 📺 Output Console
- **Real-time execution results**
- **Color-coded output** (info/success/error/warnings)
- **Console.log capture** - all console methods displayed
- **Status badges** showing execution state:
  - 🟦 Ready (blue)
  - 🟧 Running... (orange)
  - 🟩 Completed (green)
  - 🟥 Error (red)

### 📜 Execution Logs
- **Timestamped activity log** for all operations
- **Entry counter** showing total log entries
- **Color-coded entries** (info/success/error)
- **Auto-scroll** to latest entry
- **Dedicated clear button**

### 🎮 Controls

#### Main Buttons
- **▶ Run Code** - Execute the code in the editor
- **↺ Reset** - Restore default code example and clear all outputs
- **✕ Clear Output** - Clear console output only
- **📋 Copy Code** - Copy editor content to clipboard
- **✨ Format** - Basic code formatting (trim whitespace)
- **🌙 Dark Mode** - Toggle between light and dark themes
- **💾 Export** - Download execution log as text file

#### Additional Features
- **Show timestamps** checkbox - Toggle timestamps in output
- **Keyboard shortcut**: Ctrl+Enter (or Cmd+Enter on Mac) to run code

## 🚀 How to Use

1. **Open** `index.html` in your web browser
2. **Edit** the code in the editor (default example loaded)
3. **Run** by clicking "▶ Run Code" or pressing **Ctrl+Enter**
4. **View** instant console output in the middle section
5. **Track** execution history in the logs at the bottom
6. **Toggle** dark mode with the 🌙 button
7. **Export** logs or copy code as needed
8. **Reset** anytime to restore the default example

## 💡 Default Example

The editor loads with a complete async/await example demonstrating:
- Promise creation with `setTimeout`
- Async function definitions
- Awaiting multiple asynchronous operations
- Error handling with try/catch
- Console.log statements throughout execution
- Practical user data fetching simulation

## 🎯 Perfect For

- Learning async/await concepts
- Testing Promise-based code
- Experimenting with asynchronous operations
- Understanding execution flow
- Teaching JavaScript async patterns
- Quick prototyping

## 🛠️ Technical Details

- **Pure JavaScript** - No external dependencies
- **Sandboxed execution** - Code runs in isolated iframe for safety
- **Console interception** - Captures all console methods (log, info, warn, error, debug)
- **LocalStorage persistence** - Saves editor content and theme preference
- **Cross-browser compatible** - Works in all modern browsers

## 📁 Files

- `index.html` - Main HTML structure and styles
- `app.js` - JavaScript logic and functionality
- `script.js.backup` - Backup of previous version

## 🎨 Theme

The interface supports two themes:
- **Light Mode** (default) - Purple gradient with white background
- **Dark Mode** - Dark blue gradient with dark backgrounds

Theme preference is saved to localStorage and persists across sessions.

## 🔧 Customization

You can customize:
- Default code example (edit `defaultCode` in app.js)
- Color scheme (modify CSS in index.html)
- Status badge colors (adjust `updateStatus` function)
- Export filename format (change in export button handler)

## 📝 Notes

- Code is auto-saved every 400ms after typing stops
- Execution happens in a sandboxed iframe for security
- All console output is captured and displayed
- Logs persist until manually cleared or page refresh
- Dark mode preference is saved to localStorage

## 🐛 Troubleshooting

If buttons aren't working:
1. Check browser console for errors (F12)
2. Make sure JavaScript is enabled
3. Try clearing localStorage: `localStorage.clear()`
4. Refresh the page

If code isn't executing:
1. Check for syntax errors in your code
2. Look at the error messages in the output console
3. Try the default example first (click Reset)

---

**Enjoy coding with async/await! 🚀**
