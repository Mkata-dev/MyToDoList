/**
 * storage.js
 * Layer 1: Data Access Layer
 * Handles localStorage persistence, error handling, quota checks, and corruption recovery.
 * Architecture Reference: architecture.md (Section 3, 16)
 */

const StorageManager = {
  /**
   * Checks if localStorage is available and functional (e.g. not blocked by private mode or full quota)
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('StorageManager: localStorage is not accessible', e);
      return false;
    }
  },

  /**
   * Safely retrieves all tasks from localStorage.
   * Gracefully falls back to an empty array on parse errors to prevent app crashes.
   * @returns {Array} Array of Task objects
   */
  getAll() {
    if (!this.isAvailable()) return [];
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Fallback check for PRD-specified key 'todo-app-tasks'
        raw = localStorage.getItem('todo-app-tasks');
      }
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn('StorageManager: localStorage parse error, returning fallback empty list', error);
      return [];
    }
  },

  /**
   * Persists full tasks array to localStorage.
   * @param {Array} tasks
   * @returns {boolean} True if successful, false if failed (e.g., quota exceeded)
   */
  save(tasks) {
    if (!this.isAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('StorageManager: Failed to write to localStorage', error);
      return false;
    }
  },

  /**
   * Appends a new task to storage.
   * @param {Object} task
   * @returns {boolean}
   */
  add(task) {
    const tasks = this.getAll();
    tasks.unshift(task);
    return this.save(tasks);
  },

  /**
   * Updates an existing task by its unique ID.
   * @param {string} id
   * @param {Object} updatedFields
   * @returns {boolean}
   */
  update(id, updatedFields) {
    const tasks = this.getAll();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;

    tasks[index] = {
      ...tasks[index],
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    return this.save(tasks);
  },

  /**
   * Deletes a task by ID.
   * @param {string} id
   * @returns {boolean}
   */
  delete(id) {
    const tasks = this.getAll();
    const filtered = tasks.filter((t) => t.id !== id);
    return this.save(filtered);
  },

  /**
   * Clears all tasks from storage.
   * @returns {boolean}
   */
  clear() {
    if (!this.isAvailable()) return false;
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Gets stored theme preference ('light' | 'dark' | null)
   * @returns {string|null}
   */
  getTheme() {
    if (!this.isAvailable()) return null;
    return localStorage.getItem(THEME_STORAGE_KEY);
  },

  /**
   * Sets stored theme preference ('light' | 'dark')
   * @param {string} theme
   */
  setTheme(theme) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('StorageManager: Failed to save theme', e);
    }
  },

  /**
   * Retrieves user preferences (Dark Mode, Accent Color, Text Style, Background)
   * @returns {Object|null}
   */
  getSettings() {
    if (!this.isAvailable()) return null;
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('StorageManager: Failed to parse settings', e);
      return null;
    }
  },

  /**
   * Persists user preferences to localStorage
   * @param {Object} settings
   */
  saveSettings(settings) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('StorageManager: Failed to save settings', e);
    }
  },

  /**
   * Retrieves last-selected filter preference ('all' | 'active' | 'completed' | null)
   * PRD Reference: Section 4
   * @returns {string|null}
   */
  getFilter() {
    if (!this.isAvailable()) return null;
    return localStorage.getItem(FILTER_STORAGE_KEY);
  },

  /**
   * Persists last-selected filter preference to localStorage
   * @param {string} filter
   */
  setFilter(filter) {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, filter);
    } catch (e) {
      console.warn('StorageManager: Failed to save filter', e);
    }
  },
};

