/**
 * constants.js
 * Centralized application constants: storage keys, selectors, class names,
 * filters, error messages, and unique ID generation.
 * Architecture Reference: architecture.md (Section 15, 22)
 */

const STORAGE_KEY = 'todo-app:tasks';
const THEME_STORAGE_KEY = 'todo-app:theme';
const SETTINGS_STORAGE_KEY = 'todo-app:settings';
const FILTER_STORAGE_KEY = 'todo-app:filter';

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const PRIORITIES = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const CSS_CLASSES = {
  TASK_ITEM: 'task-item',
  TASK_COMPLETED: 'task-item--completed',
  TASK_REMOVING: 'task-item--removing',
  TASK_EDITING: 'task-item--editing',
  TASK_PINNED: 'task-item--pinned',
  TASK_DRAGGING: 'task-item--dragging',
  TASK_DRAG_OVER_TOP: 'task-item--drag-over-top',
  TASK_DRAG_OVER_BOTTOM: 'task-item--drag-over-bottom',
  FILTER_ACTIVE: 'filter-btn--active',
  INPUT_ERROR: 'task-input--error',
  HIDDEN: 'hidden',
};

const SELECTORS = {
  TASK_FORM: '#taskForm',
  TASK_INPUT: '#taskInput',
  PRIORITY_SELECT: '#taskPrioritySelect',
  ADD_BTN: '#addBtn',
  TASK_LIST: '#taskList',
  FILTER_BTNS: '.filter-btn',
  CLEAR_BTN: '#clearBtn',
  TASK_COUNT: '#taskCount',
  EMPTY_STATE: '#emptyState',
  EMPTY_MESSAGE: '#emptyMessage',
  ERROR_MSG: '#inputError',
  THEME_TOGGLE: '#themeToggle',
  CURRENT_DATE: '#currentDate',
  SEARCH_INPUT: '#searchInput',
  SHORTCUTS_BTN: '#shortcutsBtn',
  SHORTCUTS_MODAL: '#shortcutsModal',
  MODAL_CLOSE_BTN: '#modalCloseBtn',
  SETTINGS_BTN: '#settingsBtn',
  SETTINGS_MODAL: '#settingsModal',
  SETTINGS_CLOSE_BTN: '#settingsCloseBtn',
  THEME_MODE_BTNS: '.theme-mode-btn',
  ACCENT_COLOR_BTNS: '.accent-color-btn',
  FONT_FAMILY_BTNS: '.font-family-btn',
  FONT_SIZE_BTNS: '.font-size-btn',
  BG_STYLE_BTNS: '.bg-style-btn',
  DELETE_MODAL: '#deleteModal',
  DELETE_MODAL_DESC: '#deleteModalDesc',
  CONFIRM_DELETE_BTN: '#confirmDeleteBtn',
  CANCEL_DELETE_BTN: '#cancelDeleteBtn',
};

const MESSAGES = {
  EMPTY_ALL: 'No tasks yet — add one above!',
  EMPTY_ACTIVE: 'No active tasks. Great job, you are all caught up!',
  EMPTY_COMPLETED: 'No completed tasks yet. Finish a task to see it here!',
  ERROR_EMPTY: 'Task description cannot be empty.',
  ERROR_TOO_LONG: 'Task is too long (maximum 200 characters).',
  ERROR_STORAGE: 'Storage quota exceeded or unavailable. Could not save task.',
};

const LIMITS = {
  MAX_TASK_LENGTH: 200,
  MAX_TASKS: 200,
};

/**
 * Nano ID Generator (collision-resistant timestamp + random string)
 * Reference: architecture.md (Section 15)
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
