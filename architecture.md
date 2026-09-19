# To-Do List App - Architecture Design Document

## 1. Project Overview
A lightweight, client-side to-do application with:
- **Tech Stack**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Persistence**: Browser localStorage
- **Scope**: Single Page Application (SPA)
- **Deployment**: Static HTML file or simple folder structure

---

## 2. File Structure & Organization

```
todo-app/
├── index.html          # Main entry point
├── css/
│   ├── styles.css      # Global styles
│   └── components.css  # Component-specific styles
├── js/
│   ├── main.js         # App initialization & event delegation
│   ├── storage.js      # localStorage abstraction layer
│   ├── taskManager.js  # Business logic for tasks
│   ├── ui.js          # DOM manipulation & rendering
│   └── constants.js    # App constants (keys, class names, selectors)
└── README.md          # Documentation
```

### Why This Structure?
- **Separation of Concerns**: Each JS file has one responsibility
- **Modularity**: Easy to test, debug, and extend
- **Maintainability**: Clear file purposes make it beginner-friendly
- **Scalability**: Can grow without becoming messy

---

## 3. Architectural Layers

### Layer 1: Data Layer (storage.js)
**Responsibility**: Handle all localStorage operations
**Module**: `StorageManager`

```javascript
StorageManager {
  - getAll()           // Fetch all tasks
  - save(tasks)        // Save tasks array to localStorage
  - add(task)          // Add single task
  - update(id, task)   // Update specific task
  - delete(id)         // Delete specific task
  - clear()            // Clear all tasks
}
```

**Why separate?**
- Abstracts localStorage complexity
- Makes switching to IndexedDB/Backend easy in future
- Provides single source of truth for data access

---

### Layer 2: Business Logic Layer (taskManager.js)
**Responsibility**: Core business logic independent of UI
**Module**: `TaskManager`

```javascript
TaskManager {
  - createTask(text)              // Create new task with ID & timestamp
  - completeTask(id)              // Toggle completion status
  - deleteTask(id)                // Remove task
  - getTasks()                    // Get all tasks
  - getFilteredTasks(filter)      // Get tasks by filter (all/active/completed)
  - getTaskStats()                // { total, completed, active }
  - editTask(id, newText)         // Update task text
}
```

**Why separate?**
- Business logic can be tested without touching DOM
- Logic can be reused if app moves to a framework/backend
- Makes the code testable and maintainable

---

### Layer 3: Presentation Layer (ui.js)
**Responsibility**: All DOM interactions and rendering
**Module**: `UIManager`

```javascript
UIManager {
  - render()                      // Render entire task list
  - renderTask(task)              // Render single task
  - renderStats()                 // Update task counters
  - setActiveFilter(filter)       // Highlight active filter button
  - clearInput()                  // Clear input field
  - showEmptyState()              // Show "no tasks" message
  - showError(message)            // Display error to user
}
```

**Why separate?**
- Isolates UI changes from logic
- Easy to redesign UI without touching logic
- Makes DOM manipulation predictable

---

### Layer 4: Controller Layer (main.js)
**Responsibility**: Orchestrate layers, handle events
**Module**: Event Delegation & App Initialization

```javascript
App {
  - init()                        // Initialize app on page load
  - attachEventListeners()        // Delegate events
  - onAddTask(text)              // Handle add task event
  - onCompleteTask(id)           // Handle toggle complete event
  - onDeleteTask(id)             // Handle delete event
  - onFilterChange(filter)       // Handle filter button click
}
```

**Why this pattern?**
- One place where all layers communicate
- Event delegation improves performance
- Easy to trace data flow

---

## 4. Data Flow Diagram

```
User Action (Click/Input)
        ↓
    main.js (Event Handler)
        ↓
    taskManager.js (Business Logic)
        ↓
    storage.js (Persist to localStorage)
        ↓
    taskManager.js (Return updated data)
        ↓
    ui.js (Render to DOM)
```

**Example: Adding a Task**
1. User types text and clicks "Add" button
2. `main.js` captures event
3. Validates input (non-empty check)
4. Calls `TaskManager.createTask(text)`
5. `TaskManager` creates task object with unique ID
6. Returns task object
7. `StorageManager.add(task)` saves to localStorage
8. `UIManager.renderTask(task)` adds to DOM
9. Clear input field

---

## 5. Data Model (Task Object)

```javascript
Task {
  id: string              // Unique identifier (timestamp or UUID)
  text: string            // Task description
  completed: boolean      // Completion status
  createdAt: string       // ISO timestamp
  updatedAt: string       // ISO timestamp (optional)
}
```

**localStorage Structure**:
```javascript
Key: 'todo-app:tasks'
Value: JSON.stringify([
  { id: '1699999999999', text: 'Buy groceries', completed: false, createdAt: '2026-09-19T10:00:00Z' },
  { id: '1700000000000', text: 'Review code', completed: true, createdAt: '2026-09-19T11:00:00Z' }
])
```

---

## 6. Component Architecture

### HTML Components (with data attributes for easier selection)

```html
<div class="todo-container">
  <!-- Input section -->
  <div class="input-section">
    <input type="text" id="taskInput" class="task-input" placeholder="Add a new task...">
    <button id="addBtn" class="add-btn">Add</button>
  </div>

  <!-- Filter section -->
  <div class="filters">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="active">Active</button>
    <button class="filter-btn" data-filter="completed">Completed</button>
  </div>

  <!-- Stats section -->
  <div class="stats">
    <span id="taskCount">0 items left</span>
    <button id="clearBtn" class="clear-btn">Clear Completed</button>
  </div>

  <!-- Task list -->
  <div id="taskList" class="task-list">
    <!-- Tasks rendered here by JavaScript -->
  </div>

  <!-- Empty state -->
  <div id="emptyState" class="empty-state" style="display: none;">
    <p>No tasks yet. Add one above!</p>
  </div>
</div>
```

**Naming Convention**:
- Use `data-*` attributes for JavaScript selectors (more robust than classes)
- Example: `data-task-id="1699999999999"` for task elements

---

## 7. State Management Strategy

### Single Source of Truth
- All state lives in **TaskManager** (in-memory)
- Changes flow through **StorageManager** (persisted)
- UI is always derived from state

### State Update Pattern (One-way Data Flow)
```
Action Triggered
    ↓
TaskManager Updates State
    ↓
StorageManager Persists
    ↓
UIManager Re-renders
```

### No Direct DOM Manipulation in Logic
- Never update DOM from `taskManager.js`
- All DOM updates go through `ui.js`
- This keeps layers decoupled

---

## 8. Event Handling Strategy

### Event Delegation (Best Practice)
```javascript
// Instead of attaching listeners to each task item:
// ❌ Bad: loop through 100 tasks and attach listeners
// ✅ Good: attach ONE listener to parent container

document.getElementById('taskList').addEventListener('click', (e) => {
  if (e.target.classList.contains('complete-btn')) {
    handleComplete(e.target.closest('[data-task-id]').dataset.taskId);
  }
  if (e.target.classList.contains('delete-btn')) {
    handleDelete(e.target.closest('[data-task-id]').dataset.taskId);
  }
});
```

**Benefits**:
- Better performance (one listener vs many)
- Handles dynamically added elements
- Cleaner code

---

## 9. Error Handling Strategy

### Graceful Degradation
```javascript
try {
  StorageManager.save(tasks);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    UIManager.showError('Storage full! Delete some tasks.');
  } else {
    UIManager.showError('Failed to save task. Try again.');
  }
  console.error('Storage error:', error);
}
```

### Validation Layers
1. **Input Validation** (main.js): Check user input is non-empty
2. **Business Logic** (taskManager.js): Validate task data
3. **Storage** (storage.js): Handle localStorage errors

---

## 10. CSS Architecture (BEM Naming)

### BEM (Block Element Modifier) Pattern
```css
/* Block: todo-container */
.todo-container { }

/* Element: input within container */
.todo-container__input { }

/* Modifier: input when focused */
.todo-container__input--focused { }

/* Separate block: task item */
.task-item { }
.task-item__text { }
.task-item__checkbox { }
.task-item--completed { }
.task-item--completed .task-item__text { /* strikethrough */ }
```

**CSS File Organization**:
```css
/* styles.css: Global styles, resets, layout */
- CSS reset / normalize
- Root variables (colors, spacing)
- Typography
- Layout grid

/* components.css: Component-specific styles */
- Input section
- Filter buttons
- Task items
- Empty state
```

---

## 11. Initialization Flow

### On Page Load
```
1. StorageManager loads tasks from localStorage
2. TaskManager initializes with loaded tasks
3. UIManager renders initial task list
4. Event listeners attached via delegation
5. App ready for user interaction
```

```javascript
// main.js
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
```

---

## 12. Key Design Principles Applied

| Principle | Implementation |
|---|---|
| **DRY** | Each layer handles one responsibility; no duplicated logic |
| **SOLID** | Single responsibility per module; open to extension |
| **Separation of Concerns** | Data, logic, UI completely separated |
| **Abstraction** | StorageManager abstracts localStorage details |
| **Testability** | Business logic has no DOM dependencies |
| **Performance** | Event delegation; minimal DOM reflows |
| **Accessibility** | Semantic HTML; ARIA labels where needed |

---

## 13. Future Extensibility

### Easy to Add:
- **LocalStorage to Backend**: Swap `StorageManager` implementation
- **Framework Migration**: Move UI layer to React/Vue while keeping logic
- **New Features**: Add methods to layers without affecting others
- **Drag-and-drop**: Add event listeners without changing layers
- **Dark mode**: Update CSS and storage preference without touching logic
- **Testing**: Mock StorageManager for unit tests; mock UIManager for integration tests

### Would Look Like:
```javascript
// Example: Adding edit feature
// Step 1: Add method to TaskManager
TaskManager.editTask(id, newText) { /* ... */ }

// Step 2: Add method to UIManager
UIManager.renderEditMode(taskId) { /* ... */ }

// Step 3: Add event listener in main.js
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    // Handle edit
  }
});

// No changes needed to StorageManager if storage format stays same!
```

---

## 14. Development Checklist

- [ ] Create folder structure
- [ ] Write `constants.js` (keys, selectors, class names)
- [ ] Write `storage.js` (StorageManager)
- [ ] Write `taskManager.js` (TaskManager)
- [ ] Write `ui.js` (UIManager)
- [ ] Write `main.js` (Event handlers, initialization)
- [ ] Write `styles.css` + `components.css`
- [ ] Write `index.html`
- [ ] Test add/complete/delete/filter
- [ ] Test localStorage persistence (refresh page)
- [ ] Test on mobile screen size
- [ ] Browser compatibility check

---

## 15. ID Generation Strategy

### Why Not Just Use `Date.now()`?
Using only timestamps as IDs is risky — if two tasks are added within the same millisecond (e.g. programmatically), IDs collide and tasks overwrite each other.

### Recommended: Nano ID (lightweight UUID-like)
```javascript
// constants.js
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  // Example output: "1699999999999-x4k2pqr"
};
```

**Benefits**:
- Collision-resistant without an external library
- Human-readable with timestamp prefix (easy to sort by creation)
- Simple enough for beginners to understand

---

## 16. localStorage Safety & Corruption Handling

### The Problem
- localStorage can contain corrupted/invalid JSON (from a previous bug, browser extension, etc.)
- Accessing localStorage can throw in private browsing mode on some browsers
- localStorage quota can be exceeded silently in some browsers

### Safe localStorage Wrapper
```javascript
// storage.js
const StorageManager = {
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false; // Private mode, quota exceeded, or disabled
    }
  },

  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('localStorage parse error — resetting tasks', e);
      return []; // Return safe fallback instead of crashing
    }
  }
};
```

**Rule**: Always wrap `JSON.parse(localStorage.getItem(...))` in a try/catch — corrupted data will throw and crash the app without it.

---

## 17. Accessibility (A11y) Architecture

Accessibility is not optional — even for beginner projects. These are the minimum requirements:

### Semantic HTML
```html
<!-- ❌ Bad: divs for everything -->
<div class="task" onclick="...">Buy groceries</div>

<!-- ✅ Good: semantic elements with roles -->
<li class="task-item" role="listitem">
  <input type="checkbox" id="task-1" aria-label="Mark Buy groceries as complete">
  <label for="task-1">Buy groceries</label>
  <button aria-label="Delete Buy groceries">🗑</button>
</li>
```

### Required ARIA Attributes
```html
<!-- Task list container -->
<ul id="taskList" role="list" aria-label="Task list" aria-live="polite">

<!-- Filter buttons -->
<button class="filter-btn" aria-pressed="true" data-filter="all">All</button>

<!-- Input with error -->
<input type="text" id="taskInput" aria-describedby="inputError">
<span id="inputError" role="alert" aria-live="assertive"></span>

<!-- Empty state -->
<p id="emptyState" aria-live="polite">No tasks yet. Add one above!</p>
```

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to toggle checkbox or activate buttons
- Escape to cancel inline edit
- All actions reachable without a mouse

### Focus Management
```javascript
// After adding a task, return focus to input
UIManager.clearInput = () => {
  taskInput.value = '';
  taskInput.focus(); // ← Critical for keyboard users
};
```

---

## 18. UI State Inventory

Every possible screen state the UI must handle — missing any one causes bugs or a broken-looking interface:

| State | What Triggers It | UI Response |
|---|---|---|
| **Empty (no tasks)** | Fresh load / all tasks deleted | Show empty-state message; hide task list |
| **Tasks exist** | At least one task added | Show task list; hide empty state |
| **Filter: Active** | Click "Active" filter | Show only incomplete tasks |
| **Filter: Completed** | Click "Completed" filter | Show only completed tasks |
| **Filter: All** | Click "All" filter | Show all tasks |
| **Filter empty** | Filter active but no matching tasks | Show "No tasks here" sub-message |
| **Input error** | Add clicked with empty input | Show inline error; shake input |
| **Task in edit mode** | Double-click task text | Show editable input inline |
| **Storage error** | localStorage full or unavailable | Show banner error, don't crash |
| **All completed** | Every task is checked | "Clear completed" button becomes prominent |
| **Loading** | Page first loads from localStorage | Brief render before paint (avoid flash) |

---

## 19. Animation & Transition Strategy

Small, purposeful animations make the app feel polished and give users feedback. No libraries needed — CSS transitions only.

```css
/* Task appears smoothly */
.task-item {
  animation: slideIn 0.2s ease-out;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Task is removed (apply class, then remove element after transition) */
.task-item--removing {
  animation: slideOut 0.2s ease-in forwards;
}
@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(20px); }
}

/* Checkbox complete toggle */
.task-item__text {
  transition: text-decoration 0.15s ease, color 0.15s ease;
}
.task-item--completed .task-item__text {
  text-decoration: line-through;
  color: #aaa;
}

/* Input shake on empty submit */
.task-input--error {
  animation: shake 0.3s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-6px); }
  75%       { transform: translateX(6px); }
}
```

### JavaScript delete-with-animation pattern
```javascript
// ui.js — delete smoothly without a flash
UIManager.removeTask = (id) => {
  const el = document.querySelector(`[data-task-id="${id}"]`);
  el.classList.add('task-item--removing');
  el.addEventListener('animationend', () => el.remove(), { once: true });
};
```

---

## 20. CSS Custom Properties (Design Tokens)

All colors, sizes, and spacing live in one place so the whole visual design can be changed in seconds (including dark mode).

```css
/* styles.css — :root block at the top */
:root {
  /* Colors */
  --color-primary:      #6c63ff;
  --color-primary-hover:#5a52d5;
  --color-danger:       #ff4d4d;
  --color-success:      #4caf50;
  --color-text:         #2d2d2d;
  --color-text-muted:   #9e9e9e;
  --color-bg:           #f5f5f5;
  --color-surface:      #ffffff;
  --color-border:       #e0e0e0;

  /* Spacing */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  32px;

  /* Typography */
  --font-family: 'Segoe UI', system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;

  /* Effects */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --transition: 0.2s ease;
}

/* Dark mode — just override the tokens */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text:    #f0f0f0;
    --color-bg:      #1a1a2e;
    --color-surface: #16213e;
    --color-border:  #333;
  }
}
```

---

## 21. Script Loading Order (index.html)

The order modules are loaded in `index.html` matters — each file depends on the one before it.

```html
<!-- index.html — bottom of <body>, correct order -->

<!-- 1. Constants first — everything else depends on these -->
<script src="js/constants.js"></script>

<!-- 2. Storage layer — no dependencies -->
<script src="js/storage.js"></script>

<!-- 3. Business logic — depends on storage -->
<script src="js/taskManager.js"></script>

<!-- 4. UI layer — depends on constants -->
<script src="js/ui.js"></script>

<!-- 5. Controller last — depends on ALL layers -->
<script src="js/main.js"></script>
```

**Why at the bottom of `<body>`?**
- DOM is fully parsed before scripts run — no need for `DOMContentLoaded` hacks
- Page HTML renders before scripts download — faster perceived load
- Avoids render-blocking

---

## 22. Constants File (Full Definition)

```javascript
// constants.js — all magic strings in one place

const STORAGE_KEY = 'todo-app:tasks';

const FILTERS = {
  ALL:       'all',
  ACTIVE:    'active',
  COMPLETED: 'completed',
};

const CSS_CLASSES = {
  TASK_ITEM:       'task-item',
  TASK_COMPLETED:  'task-item--completed',
  TASK_REMOVING:   'task-item--removing',
  FILTER_ACTIVE:   'filter-btn--active',
  INPUT_ERROR:     'task-input--error',
  HIDDEN:          'hidden',
};

const SELECTORS = {
  TASK_INPUT:   '#taskInput',
  ADD_BTN:      '#addBtn',
  TASK_LIST:    '#taskList',
  FILTER_BTNS:  '.filter-btn',
  CLEAR_BTN:    '#clearBtn',
  TASK_COUNT:   '#taskCount',
  EMPTY_STATE:  '#emptyState',
  ERROR_MSG:    '#inputError',
};

const MESSAGES = {
  EMPTY_ALL:       'No tasks yet. Add one above!',
  EMPTY_ACTIVE:    'No active tasks. Great job!',
  EMPTY_COMPLETED: 'No completed tasks yet.',
  ERROR_EMPTY:     'Task cannot be empty.',
  ERROR_TOO_LONG:  'Task is too long (max 200 characters).',
  ERROR_STORAGE:   'Could not save. Storage may be full.',
};

const LIMITS = {
  MAX_TASK_LENGTH: 200,
  MAX_TASKS:       200, // Warn user if approaching localStorage limit
};
```

---

## 23. Responsive Design Breakpoints

```css
/* Mobile-first approach */

/* Base (mobile): 320px–767px */
.todo-container {
  width: 100%;
  padding: var(--space-md);
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .todo-container {
    max-width: 600px;
    margin: var(--space-xl) auto;
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .todo-container {
    max-width: 680px;
  }
}
```

**Mobile-specific UX rules**:
- Touch targets minimum 44×44px (Apple/Google HIG)
- Input font-size minimum `16px` (prevents iOS auto-zoom)
- Delete button large enough to tap without misfire
- Filter buttons stack or scroll horizontally on small screens

---

## 24. Updated Development Checklist

- [ ] Create folder structure
- [ ] Write `constants.js` (keys, selectors, messages, limits)
- [ ] Write `storage.js` (StorageManager + availability check + safe JSON parse)
- [ ] Write `taskManager.js` (TaskManager)
- [ ] Write `ui.js` (UIManager + all 11 UI states handled)
- [ ] Write `main.js` (App + event delegation)
- [ ] Write `styles.css` (CSS tokens, reset, layout, dark mode, responsive)
- [ ] Write `components.css` (BEM components, animations)
- [ ] Write `index.html` (semantic HTML, ARIA, correct script order)
- [ ] Test: add/complete/delete/filter
- [ ] Test: all 11 UI states
- [ ] Test: localStorage persistence (refresh page)
- [ ] Test: corrupted localStorage (manually corrupt JSON in DevTools → should not crash)
- [ ] Test: localStorage unavailable (test in private mode)
- [ ] Test: keyboard-only navigation (Tab, Enter, Escape)
- [ ] Test: screen reader (basic VoiceOver/NVDA check)
- [ ] Test: mobile screen size (375px width)
- [ ] Test: dark mode (set OS to dark theme)
- [ ] Browser compatibility check (Chrome, Firefox, Safari, Edge)

---

## Summary

This architecture ensures:
✅ **Maintainable**: Clear separation makes debugging easy
✅ **Scalable**: Add features without refactoring
✅ **Testable**: Each layer can be tested independently
✅ **Beginner-Friendly**: Clear file purposes, one job per file
✅ **Professional**: Follows industry best practices
✅ **Performance**: Event delegation, minimal DOM updates
✅ **Accessible**: Semantic HTML, ARIA, keyboard navigation
✅ **Resilient**: Safe localStorage handling, corruption recovery
✅ **Polished**: Animations, design tokens, all UI states handled
✅ **Responsive**: Mobile-first, correct touch targets
