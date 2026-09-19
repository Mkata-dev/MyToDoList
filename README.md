# TaskFlow — To-Do List Application

A lightweight, zero-dependency, browser-only productivity application built with vanilla web technologies (HTML5, CSS3, and modern JavaScript). It runs completely client-side, persisting tasks across page reloads using a safe, resilient `localStorage` architecture.

---

## 🌟 Key Features

- **Quick Task Capture**: Add tasks with instant keyboard responsiveness (`Enter` key or "Add" button).
- **Safe Persistence**: Tasks are saved in browser `localStorage` with automatic quota detection and corruption recovery.
- **Smart Filtering**: Switch smoothly between **All**, **Active**, and **Completed** tasks.
- **Instant Search**: Real-time task filtering as you type in the search box.
- **Inline Editing**: Double-click any task text or click the edit icon to modify descriptions inline.
- **Micro-Animations**: Smooth CSS entry (`slideIn`), removal (`slideOut`), and validation error feedback (`shake`).
- **Dark & Light Mode**: Built-in visual theme toggle with persistent user preference and system default detection.
- **Accessible (a11y)**: Built with semantic HTML elements (`ul[role="list"]`, `li[role="listitem"]`), ARIA live regions, full keyboard navigation (`Tab`, `Space`, `Esc`), and minimum 44px mobile touch targets.

---

## 📂 Project Architecture & File Structure

This application strictly adheres to the 4-layer decoupled architecture defined in [architecture.md](file:///d:/Mkata.dev2026/To%20Do%20List%20App/architecture.md):

```
To Do List App/
├── index.html               # Main entry point & accessible HTML structure
├── css/
│   ├── styles.css           # Global design tokens, CSS variables, and layout resets
│   └── components.css       # BEM component styling and micro-animations
├── js/
│   ├── constants.js         # App constants (keys, selectors, class names, nano ID)
│   ├── storage.js           # Layer 1: Data Access & safe localStorage wrapper
│   ├── taskManager.js       # Layer 2: Business Logic & in-memory state management
│   ├── ui.js                # Layer 3: Presentation Layer & DOM rendering
│   └── main.js              # Layer 4: Controller Layer & event delegation
├── designs/                 # Stitch-generated UI screens and reference code
├── pages.md                 # UI screen specifications & Stitch generation prompts
├── prd.md                   # Product Requirements Document
├── architecture.md          # Comprehensive Architecture Design Document
└── README.md                # Project documentation
```

### Script Dependency Loading Order
Scripts are loaded at the bottom of `<body>` in strict architectural dependency sequence:
1. `constants.js` — Core keys and selectors (no dependencies)
2. `storage.js` — Data access layer
3. `taskManager.js` — Business logic (depends on storage & constants)
4. `ui.js` — DOM presentation layer (depends on constants)
5. `main.js` — Controller orchestrator (depends on all layers)

---

## 🚀 Getting Started & Local Server

### 1. Run the Local Development Server (Recommended)
You can start the built-in development server with zero setup:

```bash
# Using npm
npm run dev

# Or directly with Node
node server.js
```

The app will immediately be available at:
👉 **`http://localhost:3000`**

### 2. Alternative: Open Directly in Browser
You can also open `index.html` directly in any web browser without a server:
```bash
# Windows PowerShell
Start-Process index.html
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Save new task / Save edited task |
| `Double Click` | Edit selected task text |
| `Esc` | Cancel inline editing / Close modals |
| `Ctrl + /` (or `⌘/`) | Open keyboard shortcuts help dialog |
| `Tab` / `Shift + Tab` | Navigate accessible elements |

---

## 🛠️ Tech Stack

- **Markup**: Semantic HTML5 with ARIA attributes
- **Styling**: Vanilla CSS3 (Custom Properties, BEM naming, Keyframes)
- **Logic**: ES6+ JavaScript (Modular object literal design patterns)
- **Persistence**: Safe `localStorage` API
