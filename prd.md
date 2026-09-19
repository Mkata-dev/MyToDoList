Here's a clean, beginner-friendly PRD for a browser-only To-Do List app.

## 1. Overview
A single-page to-do list that runs entirely in the browser — no sign-up, no server, no database. All tasks are saved in the browser's **localStorage**, so they persist across page refreshes but stay on that one device/browser.

## 2. Goals
- Let a user quickly capture and manage tasks with zero setup
- Keep the codebase simple enough to be a good learning project (plain HTML/CSS/JS is enough)
- Data should survive a page reload without needing a backend

## 3. Core Features (MVP)

| Feature | Behavior |
|---|---|
| **Add Task** | Text input + "Add" button (and Enter key). Reject empty/whitespace-only input. |
| **Mark Complete** | Click a checkbox (or the task itself) to toggle done/not done. Completed tasks show strikethrough or greyed-out styling. |
| **Delete Task** | A delete/trash icon on each task removes it immediately. |
| **Filter Tasks** | Tabs or buttons: **All / Active / Completed**. |
| **Persistence** | Every add/complete/delete/edit writes to `localStorage`. On page load, tasks are read back from `localStorage`. |

## 4. Nice-to-Have (Stretch) Features
- Edit task text inline (double-click to edit)
- "X items left" counter
- "Clear completed" button
- Empty-state message ("No tasks yet — add one above!")
- Due dates or simple priority tags
- Drag-and-drop reordering
- Dark mode toggle
- Remember last-selected filter across reloads
- Simple text search box

## 5. Non-Functional Requirements
- No authentication, no backend, no external database
- Fully functional offline once the page is loaded
- Responsive — usable on both desktop and mobile screen sizes
- Minimal dependencies (vanilla JS is plenty; no framework required)
- Works in modern browsers (Chrome, Firefox, Safari, Edge)

## 6. Data Model (localStorage)
A simple JSON array stored under one key, e.g. `todo-app-tasks`:
```json
[
  { "id": "1699999999999", "text": "Buy groceries", "completed": false, "createdAt": "2026-09-19T10:00:00Z" }
]
```

## 7. Success Criteria
- User can add, complete, delete, and filter tasks without errors
- Tasks are still there after refreshing the page
- Works smoothly on both mobile and desktop widths

---

