# To-Do List Application — Pages & UI Prompts for Google Stitch

This document defines all primary screens, views, and modal states required for the **Browser-Only To-Do List Application** (based on [prd.md](file:///d:/Mkata.dev2026/To%20Do%20List%20App/prd.md) and [architecture.md](file:///d:/Mkata.dev2026/To%20Do%20List%20App/architecture.md)).

Each section provides a **ready-to-use, comprehensive prompt** optimized for **Google Stitch** to generate pixel-perfect, modern, accessible UI designs.

---

## 📋 Screens Overview

| # | Screen / State | Type | Description |
|---|---|---|---|
| **1** | **Main Task Dashboard** | Primary Desktop View | The core dashboard showing active tasks, input bar, filters, and status counters. |
| **2** | **Empty State / Zero Tasks** | Initial & Clean State | The onboarding view displayed when no tasks exist or after clearing all items. |
| **3** | **Completed Tasks & Filter View** | Filtered List State | View focused on finished items with strikethrough styling and bulk clear actions. |
| **4** | **Inline Edit & Validation States** | Interactive Component State | Shows active inline text editing, character count indicator, and input error shake. |
| **5** | **Settings & Shortcuts Modal** | Slide-Over / Dialog | Theme switcher, keyboard shortcut cheat-sheet, and data export/import utilities. |
| **6** | **Mobile Responsive View** | Mobile Portrait (390px) | Touch-optimized layout with bottom input, 48px touch targets, and compact filter chips. |

---

 checkboxes, task titles, creation timestamps (`"Created 2 hours ago"`), subtle priority color tag, and hover action buttons (edit pencil, delete trash can).
- **Footer / Status Bar**: Active counter (`"3 items left"`), filter summary, and a `"Clear Completed"` secondary button.

---
## Screen 1: Main Task Dashboard (Desktop Default View)

### Purpose
The primary interface where users spend 90% of their time: quickly adding, organizing, checking off, and filtering tasks.

### Target Viewport
* **Desktop**: 1440 × 900 px (centered container: `max-width: 680px`)

### Key Elements & Components
- **Top Header**: App logo/icon, app title ("TaskFlow"), current date badge, and theme toggle icon button (Sun/Moon).
- **Task Input Bar**: Prominent input field with placeholder `"What needs to be done?"`, an Enter key badge icon (`↵`), and an elevated `"Add Task"` button with an icon (`+`).
- **Filter Bar**: Pill-shaped segmented control with tabs: `All (5)`, `Active (3)`, `Completed (2)`, plus a subtle search bar on the right.
- **Task List (Active Items)**: Clean list cards with custom circular
### 🎨 Google Stitch Prompt (Copy & Paste)

```text
Design a modern, ultra-clean desktop web application interface for a Single Page To-Do List app called "TaskFlow".

Layout & Dimensions:
- Viewport: Desktop 1440x900px, centering a sleek card container (max-width: 680px) on a subtle tinted background (#0F172A dark slate or #F8FAFC crisp off-white).
- Modern minimalist aesthetic inspired by Linear and Notion with subtle glassmorphism and soft ambient shadows.

Header Section:
- Top bar with a minimalist checkmark logo in electric violet (#6366F1), title "TaskFlow", and a subtle badge showing today's date "Saturday, Sep 19".
- Top-right corner includes a theme switch toggle button (Sun/Moon icon) and a keyboard shortcuts hint icon (⌘/).

Task Input Section:
- An elevated, pill-radius input box with a soft gradient border on focus.
- Placeholder text: "Add a new task... (Press Enter to save)".
- Right side of input has a keyboard badge "↵ Enter" and a vibrant violet action button labeled "Add Task" with a plus icon.

Filter & Controls Toolbar:
- Horizontal segmented pill tabs: "All (5)" [active state with soft indigo fill], "Active (3)", and "Completed (2)".
- A compact inline search input with a magnifying glass icon to filter tasks in real-time.

Task List Items:
- Render a list of 4 tasks with generous padding and 8px border radius:
  1. "Finalize architectural design document" (Incomplete, custom circular checkbox unchecked, crisp typography, creation time pill "10 mins ago", subtle blue priority tag "High").
  2. "Implement Safe Storage Manager layer in JavaScript" (Incomplete, unchecked, "2 hours ago", purple tag "Core").
  3. "Refactor CSS variables for system dark mode" (Incomplete, unchecked, "Yesterday").
  4. "Setup index.html structure and ARIA attributes" (Completed, checked with an electric violet checkmark, text with strikethrough and muted gray color #94A3B8).
- Each task row has quick-action icon buttons that reveal on hover: Edit (pencil icon) and Delete (trash bin icon with red hover effect).

Footer Summary Bar:
- Bottom bar showing "3 tasks remaining", a subtle progress bar showing 25% completed, and a "Clear Completed" button with muted text styling.

Visual Style:
- Typography: Inter font family, modern weights (400, 500, 600).
- Palette: Dark mode default (Background #0F172A, Card surface #1E293B, Primary accent #6366F1, Border #334155, Text primary #F8FAFC, Text secondary #94A3B8, Danger #EF4444).
- Crisp vector icons, polished micro-details, clean hierarchy.
```

---

## Screen 2: Empty State / Zero Tasks (Onboarding View)

### Purpose
Displayed when the user first opens the app with no tasks in `localStorage`, or when all tasks have been completed and deleted.

### Target Viewport
* **Desktop**: 1440 × 900 px (centered container: `max-width: 680px`)

### Key Elements & Components
- **Input Bar**: Focused and prominent to encourage immediate interaction.
- **Empty State Hero Card**:
  - Whimsical or minimalist vector illustration / 3D iconography (e.g., a serene checklist with floating sparkles, or a coffee cup with a sun).
  - Primary headline: `"You're all caught up!"` or `"No tasks yet"`.
  - Supporting subtext: `"Your to-do list is empty. Add a task above or pick one of the quick suggestions below to get started."`
- **Quick-Start Suggestions**: Clickable starter task chips/pills (e.g., `+ Plan week ahead`, `+ Read for 20 mins`, `+ Drink 2L water`).

---

### 🎨 Google Stitch Prompt (Copy & Paste)

```text
Design the Empty State / Zero-Tasks screen for a modern desktop To-Do List web application ("TaskFlow").

Layout:
- Centered container (max-width: 680px) on a modern dark slate background (#0F172A).
- Top header with logo "TaskFlow", current date badge, and dark mode toggle.
- Input bar at the top: active with a blinking cursor and placeholder "Add a new task... (Press Enter to save)".

Empty State Center Stage:
- In place of the task list, display a beautifully crafted empty state card.
- A minimalist, glowing vector illustration in the center featuring an organized floating clipboard with a subtle violet (#6366F1) and cyan ambient glow.
- Heading below illustration: "Clear mind, clear slate" in bold white typography (20px).
- Subtext: "You have no tasks on your list. Add your first goal above or start with a quick idea below." in soft gray (#94A3B8).

Starter Suggestions:
- A horizontal wrap of 3 clickable suggestion pills with dashed borders:
  - "+ Plan weekly goals"
  - "+ Review project roadmap"
  - "+ Take a 15-minute walk"
- Hover state on pills shows an indigo tint and transition.

Footer:
- Status text showing "0 items left" and disabled "Clear Completed" button.

Aesthetics:
- Clean, inspiring, zero-clutter feel. Inter font, glowing accents, polished glassmorphism container with 1px border (#334155).
```

---

## Screen 3: Completed Tasks & Filter View

### Purpose
Dedicated view when the user clicks the `"Completed"` filter tab. Provides a satisfying review of accomplishments and bulk management.

### Target Viewport
* **Desktop**: 1440 × 900 px (centered container: `max-width: 680px`)

### Key Elements & Components
- **Active Tab**: `"Completed (4)"` tab highlighted with a distinct active indicator.
- **Completed Task Rows**:
  - Checked circular checkbox with vibrant checkmark.
  - Distinct strikethrough across text with dimmed typography.
  - Completion badge: `"Completed today at 2:15 PM"`.
- **Top Actions**: Bulk action banner `"4 tasks completed"` with a prominent red-tinted `"Clear All Completed"` button.
- **Empty Filter State** (fallback): If no tasks are completed, shows a gentle message: `"No completed tasks yet. Finish a task to see it here!"`.

---

### 🎨 Google Stitch Prompt (Copy & Paste)

```text
Design the "Completed Tasks Archive" view of the "TaskFlow" productivity web app.

Layout & Context:
- Desktop container (max-width: 680px) with dark mode surface styling (#1E293B) and subtle drop shadow.
- The segmented filter tab bar has "Completed (4)" actively selected with an indigo pill background (#4F46E5), while "All (6)" and "Active (2)" are inactive.

Completed Tasks Header Bar:
- A horizontal bar directly above the list:
  - Left: Green checkmark badge with text "All caught up on 4 completed items".
  - Right: A prominent danger-secondary button with a trash icon labeled "Clear All Completed" (red text #F87171 with subtle #EF444415 background).

Completed Task Items:
- 4 list items with completed visual treatment:
  1. "Write PRD and technical specification" (Checkbox checked with emerald green #10B981 fill, strike-through text in muted #94A3B8, right-aligned time stamp "Completed 1h ago").
  2. "Create repository and branch structure" (Checked, strike-through, "Completed 3h ago").
  3. "Review pull request #12" (Checked, strike-through, "Completed yesterday").
  4. "Sync with design team on color palette" (Checked, strike-through, "Completed 2 days ago").
- Each task retains an individual delete icon on the far right.

Footer:
- Shows "2 active tasks remaining" (linking back to Active filter) and overall completion progress bar at 66%.

Visual Vibe:
- Rewarding, clean, and organized. Emphasizes accomplishment with subtle green accents while keeping the interface calm and uncluttered.
```

---

## Screen 4: Task Edit Mode & Validation Error States

### Purpose
Demonstrates interaction edge cases: inline task editing (double-click/pencil click) and input validation errors (empty submission, character limit).

### Target Viewport
* **Desktop**: 1440 × 900 px (centered container: `max-width: 680px`)

### Key Elements & Components
- **Input Error State**:
  - The main input field highlighted with a red border (`#EF4444`) and subtle red glow.
  - Animated shake effect indicator.
  - Inline error alert message directly beneath input: `"Task cannot be empty. Please enter some text."` with warning icon.
- **Inline Task Edit Row**:
  - A task item converted into an active inline editable input field.
  - Character counter pill on the bottom right of the input: `"48 / 200"`.
  - Save button (`✓ Save`) in vibrant violet and Cancel button (`✕ Cancel` or `Esc`) in ghost styling.
  - Background of the editing row is slightly highlighted with an indigo border.

---

### 🎨 Google Stitch Prompt (Copy & Paste)

```text
Design the interactive state variations (Form Validation Error & Inline Task Editing) for the "TaskFlow" web app.

Component 1: Input Validation Error (Top section):
- The main task input field displays an active error state:
  - Border is 1.5px solid vibrant crimson (#EF4444) with an outer red halo glow (rgba(239, 68, 68, 0.2)).
  - An inline helper alert below the input with a red exclamation triangle icon and text: "Task cannot be empty. Please type something." (13px, #F87171).
  - The "Add Task" button is temporarily disabled or visually locked.

Component 2: Inline Task Editing Mode (Middle of task list):
- One of the task rows is actively being edited:
  - The row expands slightly with an accented indigo border (#6366F1) and deeper slate background (#0F172A).
  - An inline text input box contains: "Prepare slides for the quarterly project demo".
  - Right corner inside the input displays a subtle character limit counter: "48/200".
  - Two inline action buttons on the right side of the row:
    - "Save" button with a checkmark icon in solid violet (#6366F1).
    - "Cancel" button with an X icon and keyboard badge "(Esc)" in muted gray.
  - Other task items in the list appear slightly dimmed (60% opacity) to focus user attention on the active edit row.

Overall Style:
- Professional UI engineering precision, clear affordances, accessible contrast ratios, Inter font.
```

---

## Screen 5: Settings, Shortcuts & Data Management Modal

### Purpose
A sleek slide-over panel or modal dialog providing user customization, offline storage metrics, data backup (export/import JSON), and keyboard navigation guidance.

### Target Viewport
* **Desktop**: 1440 × 900 px (modal overlay: `520px` width centered over darkened backdrop)

### Key Elements & Components
- **Modal Header**: `"Preferences & Data"`, close button (`✕` / `Esc`).
- **Section 1: Appearance**:
  - 3-way toggle button: `System` | `Light` | `Dark`.
- **Section 2: Keyboard Shortcuts Guide**:
  - Key combination chips: `Enter` (Add task), `Esc` (Cancel edit), `Tab` (Navigate elements), `Space` (Toggle task done).
- **Section 3: Storage & Data Management**:
  - Storage health indicator: `"Using 4.2 KB of browser localStorage (12 tasks saved)"`.
  - Backup actions: `"Export Tasks as JSON"` button (download icon) and `"Import Tasks"` button (upload icon).
  - Danger zone: `"Reset All Tasks"` button with confirmation warning.

---

### 🎨 Google Stitch Prompt (Copy & Paste)

```text
Design a sleek Preferences & Storage Management modal dialog for the "TaskFlow" browser application.

Layout:
- Centered modal dialog (width 520px) overlaying a blurred dark backdrop (backdrop-filter: blur(8px), rgba(0,0,0,0.6)).
- Card surface: Dark slate (#1E293B) with rounded corners (16px), 1px border (#334155), and deep drop shadow.

Modal Header:
- Title "Preferences & Data" with a small sliders/settings icon.
- Close button on top-right with an 'X' icon.

Modal Body Content:
1. Appearance Section:
   - Label: "Theme Preference".
   - 3-option segmented pill selector: [System] [Light] [Dark (Selected with violet accent)].

2. Keyboard Shortcuts Cheat Sheet:
   - A 2-column grid showing keyboard key combos styled as realistic keyboard keycaps (<kbd>):
     - [ Enter ↵ ] -> "Add new task"
     - [ Double Click ] -> "Edit task text"
     - [ Esc ] -> "Cancel editing"
     - [ Space ] -> "Toggle completion"

3. Data & LocalStorage Management:
   - A card with a database icon showing: "Storage: Browser LocalStorage", "14 Tasks Saved • 3.8 KB used".
   - Two secondary action buttons side-by-side:
     - "Export JSON" with a download icon.
     - "Import JSON" with an upload icon.

4. Danger Zone (Bottom):
   - A subtle red-tinted container with title "Reset Data" and a danger button labeled "Clear All Tasks & Storage" with a warning triangle icon.

Typography & Tokens:
- High-contrast typography (Inter), rounded keyboard key badges (<kbd>), polished micro-interactions.
```

---

## Screen 6: Mobile Responsive View (390px Viewport)

### Purpose
Specifies the mobile phone layout (iPhone / Android) ensuring touch target compliance (minimum 44×44px), thumb-zone usability, and no viewport zoom issues.

### Target Viewport
* **Mobile Portrait**: 390 × 844 px (full-width fluid layout with `16px` lateral gutters)

### Key Elements & Components
- **Top Mobile Header**: Compact header with logo, current date, and theme icon button.
- **Sticky / Accessible Input**:
  - Minimum `16px` font size (prevents iOS Safari auto-zoom).
  - Compact `"Add"` icon button next to input.
- **Scrollable Filter Chips**: Horizontally scrollable chip row: `All`, `Active`, `Completed`.
- **Touch-Friendly Task Rows**:
  - Minimum 48px height per row.
  - Large, easily tappable circular checkbox (24×24px with generous hit area).
  - Explicit delete trash icon positioned with safe spacing to prevent accidental taps.
- **Bottom Navigation / Status Bar**:
  - Sticky or bottom-anchored summary showing items count and clear completed button.

---

### 🎨 Google Stitch Prompt (Copy & Paste)

```text
Design a mobile-first responsive screen (390x844px portrait, iPhone 15 frame) for the "TaskFlow" To-Do List app.

Layout & Padding:
- 390px width, fluid 100% container with 16px horizontal margins.
- Clean dark theme (#0F172A background, #1E293B card items).

Mobile Header:
- Clean top status area with "TaskFlow" brand, date "Sat, Sep 19", and a circular theme toggle button.

Quick Task Input Bar:
- Ergonomic input bar with 48px height:
  - Input field with 16px font size (preventing mobile browser zoom) and placeholder "Add a task...".
  - Right-side circular '+' button in vivid violet (#6366F1) designed for easy one-thumb tapping.

Filter Chips (Horizontal Row):
- Horizontally scrollable filter chips with soft pill shapes:
  - "All (4)" [Active solid violet]
  - "Active (3)" [Outline slate]
  - "Completed (1)" [Outline slate]

Mobile Task List:
- 3 task items with generous touch targets (minimum 52px row height):
  1. "Buy groceries for dinner" (Unchecked custom round checkbox 24px, legible text, delete trash icon on far right with 44px touch buffer).
  2. "Review code architecture" (Unchecked, with a purple "Work" badge).
  3. "Morning workout" (Checked, strikethrough text in muted gray).

Bottom Mobile Status Bar:
- Floating bottom bar with frosted glass effect (backdrop-blur):
  - Left: "2 items left".
  - Right: Text button "Clear Done".

Aesthetics:
- Designed strictly following Apple Human Interface Guidelines and Material 3 touch target standards (minimum 44x44px hit areas).
- Inter font, vibrant indigo/violet accents, dark slate surfaces.
```

---

## 🎨 Shared Design System Tokens for Google Stitch

When customizing or extending any of the prompts above in Google Stitch, you can paste this design system reference block:

```text
Design System Tokens:
- Primary Brand Color: Electric Violet / Indigo (#6366F1)
- Primary Hover / Active: Deep Indigo (#4F46E5)
- Success / Completed: Emerald Green (#10B981)
- Danger / Delete: Crimson Red (#EF4444)
- Warning: Amber (#F59E0B)
- Dark Mode Background: Deep Slate (#0F172A)
- Dark Mode Surface / Card: Midnight Slate (#1E293B)
- Dark Mode Border: Slate Border (#334155)
- Text Primary: Pure White / Off-White (#F8FAFC)
- Text Muted: Cool Slate Gray (#94A3B8)
- Typography: Inter or Outfit, Sans-Serif
- Radius: Cards (12px), Inputs (10px), Buttons & Chips (8px or Full Pill 9999px)
- Shadows: Soft ambient blur (0 10px 25px -5px rgba(0, 0, 0, 0.3))
```
