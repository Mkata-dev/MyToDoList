/**
 * taskManager.js
 * Layer 2: Business Logic Layer
 * Pure business logic and in-memory state management. Independent of the DOM.
 * Architecture Reference: architecture.md (Section 3, 5, 7)
 */

const TaskManager = {
  /** @type {Array<{id: string, text: string, completed: boolean, createdAt: string, updatedAt?: string}>} */
  tasks: [],

  /**
   * Initializes the TaskManager state with tasks loaded from storage.
   * @param {Array} initialTasks
   */
  init(initialTasks = []) {
    this.tasks = Array.isArray(initialTasks) ? [...initialTasks] : [];
  },

  /**
   * Creates a new task object, validates text, and adds it to the in-memory array.
   * @param {string} text
   * @param {string} priority 'none' | 'low' | 'medium' | 'high'
   * @returns {{success: boolean, task?: Object, error?: string}}
   */
  createTask(text, priority = 'none') {
    const trimmed = (text || '').trim();

    if (!trimmed) {
      return { success: false, error: MESSAGES.ERROR_EMPTY };
    }

    if (trimmed.length > LIMITS.MAX_TASK_LENGTH) {
      return { success: false, error: MESSAGES.ERROR_TOO_LONG };
    }

    const validPriority = ['high', 'medium', 'low'].includes(priority) ? priority : 'none';

    const newTask = {
      id: generateId(),
      text: trimmed,
      completed: false,
      pinned: false,
      priority: validPriority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    return { success: true, task: newTask };
  },

  /**
   * Toggles the completion status of a task by ID.
   * @param {string} id
   * @returns {{success: boolean, task?: Object}}
   */
  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { success: false };

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    return { success: true, task };
  },

  /**
   * Toggles the pinned status of a task
   * @param {string} id
   * @returns {{success: boolean, task?: Object}}
   */
  togglePinTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { success: false };

    task.pinned = !task.pinned;
    task.updatedAt = new Date().toISOString();
    return { success: true, task };
  },

  /**
   * Sets the priority of a task ('none' | 'low' | 'medium' | 'high')
   * @param {string} id
   * @param {string} priority
   * @returns {{success: boolean, task?: Object}}
   */
  setPriority(id, priority) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { success: false };

    const validPriority = ['high', 'medium', 'low', 'none'].includes(priority) ? priority : 'none';
    task.priority = validPriority;
    task.updatedAt = new Date().toISOString();
    return { success: true, task };
  },

  /**
   * Cycles task priority: none -> low -> medium -> high -> none
   * @param {string} id
   * @returns {{success: boolean, task?: Object}}
   */
  cyclePriority(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { success: false };

    const cycleMap = {
      none: 'low',
      low: 'medium',
      medium: 'high',
      high: 'none',
    };

    const current = task.priority || 'none';
    task.priority = cycleMap[current] || 'none';
    task.updatedAt = new Date().toISOString();
    return { success: true, task };
  },

  /**
   * Edits the text description of a task.
   * @param {string} id
   * @param {string} newText
   * @returns {{success: boolean, task?: Object, error?: string}}
   */
  editTask(id, newText) {
    const trimmed = (newText || '').trim();

    if (!trimmed) {
      return { success: false, error: MESSAGES.ERROR_EMPTY };
    }

    if (trimmed.length > LIMITS.MAX_TASK_LENGTH) {
      return { success: false, error: MESSAGES.ERROR_TOO_LONG };
    }

    const task = this.tasks.find((t) => t.id === id);
    if (!task) return { success: false };

    task.text = trimmed;
    task.updatedAt = new Date().toISOString();
    return { success: true, task };
  },

  /**
   * Deletes a task from the list.
   * @param {string} id
   * @returns {{success: boolean, deletedId?: string}}
   */
  deleteTask(id) {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return { success: this.tasks.length < initialLength, deletedId: id };
  },

  /**
   * Moves a task to a new position relative to a target task (before or after)
   * @param {string} sourceId
   * @param {string} targetId
   * @param {'before'|'after'} position
   * @returns {boolean}
   */
  moveTask(sourceId, targetId, position = 'before') {
    if (!sourceId || !targetId || sourceId === targetId) return false;

    const sourceIndex = this.tasks.findIndex((t) => t.id === sourceId);
    if (sourceIndex === -1) return false;

    // Remove source task from array
    const [task] = this.tasks.splice(sourceIndex, 1);

    // Find new insertion point
    let targetIndex = this.tasks.findIndex((t) => t.id === targetId);
    if (targetIndex === -1) {
      // Fallback: put back at original position if target not found
      this.tasks.splice(sourceIndex, 0, task);
      return false;
    }

    if (position === 'after') {
      targetIndex += 1;
    }

    this.tasks.splice(targetIndex, 0, task);
    return true;
  },

  /**
   * Clears all completed tasks.
   * @returns {{success: boolean, removedCount: number}}
   */
  clearCompleted() {
    const beforeCount = this.tasks.length;
    this.tasks = this.tasks.filter((t) => !t.completed);
    const removedCount = beforeCount - this.tasks.length;
    return { success: removedCount > 0, removedCount };
  },

  /**
   * Returns all tasks in memory.
   * @returns {Array}
   */
  getTasks() {
    return [...this.tasks];
  },

  /**
   * Returns tasks filtered by status and optional search term.
   * @param {string} filter 'all' | 'active' | 'completed'
   * @param {string} query
   * @returns {Array}
   */
  getFilteredTasks(filter = FILTERS.ALL, query = '') {
    let result = [...this.tasks];

    // Status filter
    if (filter === FILTERS.ACTIVE) {
      result = result.filter((t) => !t.completed);
    } else if (filter === FILTERS.COMPLETED) {
      result = result.filter((t) => t.completed);
    }

    // Search query filter
    const q = (query || '').trim().toLowerCase();
    if (q) {
      result = result.filter((t) => t.text.toLowerCase().includes(q));
    }

    // Stable sort: Pinned tasks always stay at the top
    result.sort((a, b) => {
      const aPinned = Boolean(a.pinned);
      const bPinned = Boolean(b.pinned);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });

    return result;
  },

  /**
   * Calculates statistics: total, active, and completed task counts.
   * @returns {{total: number, active: number, completed: number}}
   */
  getTaskStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, active, completed };
  },
};
