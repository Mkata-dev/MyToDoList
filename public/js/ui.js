/**
 * ui.js
 * Layer 3: Presentation Layer
 * All DOM manipulation, rendering, accessible updates, animations, and state transitions.
 * Architecture Reference: architecture.md (Section 3, 6, 17, 18, 19)
 */

const UIManager = {
  // DOM Elements cache
  elements: {},

  /**
   * Initializes element selectors cache
   */
  initElements() {
    this.elements = {
      taskForm: document.querySelector(SELECTORS.TASK_FORM),
      taskInput: document.querySelector(SELECTORS.TASK_INPUT),
      prioritySelect: document.querySelector(SELECTORS.PRIORITY_SELECT),
      addBtn: document.querySelector(SELECTORS.ADD_BTN),
      taskList: document.querySelector(SELECTORS.TASK_LIST),
      filterBtns: document.querySelectorAll(SELECTORS.FILTER_BTNS),
      clearBtn: document.querySelector(SELECTORS.CLEAR_BTN),
      taskCount: document.querySelector(SELECTORS.TASK_COUNT),
      emptyState: document.querySelector(SELECTORS.EMPTY_STATE),
      emptyMessage: document.querySelector(SELECTORS.EMPTY_MESSAGE),
      errorMsg: document.querySelector(SELECTORS.ERROR_MSG),
      themeToggle: document.querySelector(SELECTORS.THEME_TOGGLE),
      currentDate: document.querySelector(SELECTORS.CURRENT_DATE),
      searchInput: document.querySelector(SELECTORS.SEARCH_INPUT),
      shortcutsBtn: document.querySelector(SELECTORS.SHORTCUTS_BTN),
      shortcutsModal: document.querySelector(SELECTORS.SHORTCUTS_MODAL),
      modalCloseBtn: document.querySelector(SELECTORS.MODAL_CLOSE_BTN),
      settingsBtn: document.querySelector(SELECTORS.SETTINGS_BTN),
      settingsModal: document.querySelector(SELECTORS.SETTINGS_MODAL),
      settingsCloseBtn: document.querySelector(SELECTORS.SETTINGS_CLOSE_BTN),
      themeModeBtns: document.querySelectorAll(SELECTORS.THEME_MODE_BTNS),
      accentColorBtns: document.querySelectorAll(SELECTORS.ACCENT_COLOR_BTNS),
      fontFamilyBtns: document.querySelectorAll(SELECTORS.FONT_FAMILY_BTNS),
      fontSizeBtns: document.querySelectorAll(SELECTORS.FONT_SIZE_BTNS),
      bgStyleBtns: document.querySelectorAll(SELECTORS.BG_STYLE_BTNS),
      deleteModal: document.querySelector(SELECTORS.DELETE_MODAL),
      deleteModalDesc: document.querySelector(SELECTORS.DELETE_MODAL_DESC),
      confirmDeleteBtn: document.querySelector(SELECTORS.CONFIRM_DELETE_BTN),
      cancelDeleteBtn: document.querySelector(SELECTORS.CANCEL_DELETE_BTN),
    };
  },

  /**
   * Renders the complete task list and updates related UI states
   * @param {Array} tasks
   * @param {Object} stats
   * @param {string} activeFilter
   */
  render(tasks, stats, activeFilter = FILTERS.ALL) {
    if (!this.elements.taskList) this.initElements();

    this.renderStats(stats);
    this.setActiveFilter(activeFilter);

    if (tasks.length === 0) {
      this.elements.taskList.innerHTML = '';
      this.showEmptyState(activeFilter);
    } else {
      this.hideEmptyState();
      this.elements.taskList.innerHTML = tasks.map((t) => this.createTaskHtml(t)).join('');
    }
  },

  /**
   * Generates accessible semantic HTML for a single task item
   * @param {Object} task
   * @returns {string} HTML string
   */
  createTaskHtml(task) {
    const completedClass = task.completed ? ` ${CSS_CLASSES.TASK_COMPLETED}` : '';
    const pinnedClass = task.pinned ? ` ${CSS_CLASSES.TASK_PINNED}` : '';
    const checkedAttr = task.completed ? 'checked' : '';
    const ariaLabel = task.completed
      ? `Mark "${this.escapeHtml(task.text)}" as incomplete`
      : `Mark "${this.escapeHtml(task.text)}" as complete`;
    const relativeTime = this.formatRelativeTime(task.createdAt);

    return `
      <li class="${CSS_CLASSES.TASK_ITEM}${completedClass}${pinnedClass}" data-task-id="${task.id}" draggable="true" role="listitem">
        <div class="task-item__content">
          <div class="task-item__drag-handle" data-action="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
            <svg width="12" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="5" r="2"></circle>
              <circle cx="8" cy="12" r="2"></circle>
              <circle cx="8" cy="19" r="2"></circle>
              <circle cx="16" cy="5" r="2"></circle>
              <circle cx="16" cy="12" r="2"></circle>
              <circle cx="16" cy="19" r="2"></circle>
            </svg>
          </div>
          <label class="task-item__checkbox-wrapper">
            <input 
              type="checkbox" 
              class="task-item__checkbox" 
              ${checkedAttr} 
              aria-label="${ariaLabel}"
              data-action="toggle"
            />
            <span class="task-item__custom-checkbox" aria-hidden="true">
              <svg class="task-item__check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          <div class="task-item__details">
            <div class="task-item__text-row">
              <span class="task-item__text" data-action="toggle" title="Click to toggle complete • Double-click to edit">${this.escapeHtml(task.text)}</span>
              ${task.priority && task.priority !== 'none' ? `
                <button type="button" class="task-item__priority-badge task-item__priority-badge--${task.priority}" data-action="cycle-priority" title="Priority: ${task.priority.toUpperCase()} (Click to cycle)">
                  <span class="priority-dot"></span>
                  <span>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                </button>
              ` : ''}
              ${task.pinned ? `
                <span class="task-item__pin-badge" title="Pinned to top">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
                  <span>Pinned</span>
                </span>
              ` : ''}
            </div>
            <div class="task-item__meta">
              <span class="task-item__timestamp">${relativeTime}</span>
            </div>
          </div>
        </div>
        <div class="task-item__actions">
          <!-- Pin Action Button -->
          <button 
            type="button" 
            class="task-item__btn task-item__btn--pin${task.pinned ? ' task-item__btn--pinned' : ''}" 
            data-action="pin" 
            aria-label="${task.pinned ? 'Unpin task from top' : 'Pin task to top'}"
            title="${task.pinned ? 'Unpin from top' : 'Pin to top'}"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="${task.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="17" x2="12" y2="22"></line>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
            </svg>
          </button>

          <!-- Edit Action Button -->
          <button 
            type="button" 
            class="task-item__btn task-item__btn--edit" 
            data-action="edit" 
            aria-label="Edit task: ${this.escapeHtml(task.text)}"
            title="Edit task"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>

          <!-- Three Dots Context Menu Button -->
          <div class="task-item__menu-wrapper">
            <button 
              type="button" 
              class="task-item__btn task-item__btn--more" 
              data-action="toggle-menu" 
              aria-label="More actions for ${this.escapeHtml(task.text)}"
              aria-haspopup="true"
              title="More actions"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="19" cy="12" r="2"></circle>
                <circle cx="5" cy="12" r="2"></circle>
              </svg>
            </button>
            <div class="task-dropdown-menu hidden" role="menu">
              <button type="button" class="task-dropdown-item" data-action="pin" role="menuitem">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="${task.pinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                <span>${task.pinned ? 'Unpin from Top' : 'Pin to Top'}</span>
              </button>
              <button type="button" class="task-dropdown-item" data-action="edit" role="menuitem">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                <span>Edit Task</span>
              </button>
              <button type="button" class="task-dropdown-item" data-action="copy" role="menuitem">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy Text</span>
              </button>
              <button type="button" class="task-dropdown-item" data-action="cycle-priority" role="menuitem">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                <span>Priority: ${task.priority && task.priority !== 'none' ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : 'Normal'}</span>
              </button>
              <div class="task-dropdown-divider"></div>
              <button type="button" class="task-dropdown-item task-dropdown-item--danger" data-action="delete" role="menuitem">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Delete Task</span>
              </button>
            </div>
          </div>

          <!-- Delete Action Button -->
          <button 
            type="button" 
            class="task-item__btn task-item__btn--delete" 
            data-action="delete" 
            aria-label="Delete task: ${this.escapeHtml(task.text)}"
            title="Delete task"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </li>
    `;
  },

  /**
   * Animates and removes a task element from the DOM smoothly
   * @param {string} id
   * @param {Function} onComplete
   */
  removeTask(id, onComplete) {
    const el = document.querySelector(`[data-task-id="${id}"]`);
    if (!el) {
      if (onComplete) onComplete();
      return;
    }

    el.classList.add(CSS_CLASSES.TASK_REMOVING);
    el.addEventListener(
      'animationend',
      () => {
        el.remove();
        if (onComplete) onComplete();
      },
      { once: true }
    );
  },

  /**
   * Updates task counters and clear completed button visibility
   * @param {{total: number, active: number, completed: number}} stats
   */
  renderStats(stats) {
    if (this.elements.taskCount) {
      const label = stats.active === 1 ? '1 item left' : `${stats.active} items left`;
      this.elements.taskCount.textContent = label;
    }

    // Dynamic Filter Counts: All (N), Active (N), Completed (N)
    if (this.elements.filterBtns) {
      this.elements.filterBtns.forEach((btn) => {
        const filter = btn.dataset.filter;
        if (filter === 'all') btn.textContent = `All (${stats.total})`;
        else if (filter === 'active') btn.textContent = `Active (${stats.active})`;
        else if (filter === 'completed') btn.textContent = `Completed (${stats.completed})`;
      });
    }

    // Visual Progress Bar
    const progressBar = document.querySelector('#progressBarContainer');
    const progressFill = document.querySelector('#progressBarFill');
    const progressText = document.querySelector('#progressText');

    if (progressBar && progressFill && progressText) {
      if (stats.total > 0) {
        const percent = Math.round((stats.completed / stats.total) * 100);
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
        progressBar.classList.remove(CSS_CLASSES.HIDDEN);
      } else {
        progressBar.classList.add(CSS_CLASSES.HIDDEN);
      }
    }

    if (this.elements.clearBtn) {
      if (stats.completed > 0) {
        this.elements.clearBtn.removeAttribute('disabled');
        this.elements.clearBtn.classList.remove(CSS_CLASSES.HIDDEN);
        this.elements.clearBtn.textContent = `Clear completed (${stats.completed})`;
      } else {
        this.elements.clearBtn.setAttribute('disabled', 'true');
        this.elements.clearBtn.classList.add(CSS_CLASSES.HIDDEN);
      }
    }
  },

  /**
   * Sets active filter visual indicator and aria-pressed attributes
   * @param {string} currentFilter
   */
  setActiveFilter(currentFilter) {
    if (!this.elements.filterBtns) return;
    this.elements.filterBtns.forEach((btn) => {
      const filter = btn.dataset.filter;
      const isActive = filter === currentFilter;
      btn.classList.toggle(CSS_CLASSES.FILTER_ACTIVE, isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  },

  /**
   * Shows empty state message tailored to current active filter
   * @param {string} filter
   */
  showEmptyState(filter = FILTERS.ALL) {
    if (!this.elements.emptyState) return;

    let message = MESSAGES.EMPTY_ALL;
    if (filter === FILTERS.ACTIVE) message = MESSAGES.EMPTY_ACTIVE;
    if (filter === FILTERS.COMPLETED) message = MESSAGES.EMPTY_COMPLETED;

    if (this.elements.emptyMessage) {
      this.elements.emptyMessage.textContent = message;
    }
    this.elements.emptyState.classList.remove(CSS_CLASSES.HIDDEN);
  },

  /**
   * Hides empty state view
   */
  hideEmptyState() {
    if (this.elements.emptyState) {
      this.elements.emptyState.classList.add(CSS_CLASSES.HIDDEN);
    }
  },

  /**
   * Clears the input field and returns keyboard focus to it
   */
  clearInput() {
    if (this.elements.taskInput) {
      this.elements.taskInput.value = '';
      this.elements.taskInput.focus();
    }
    if (this.elements.prioritySelect) {
      this.elements.prioritySelect.value = 'none';
    }
    this.clearError();
  },

  /**
   * Displays validation error message with shake animation
   * @param {string} message
   */
  showError(message) {
    if (!this.elements.taskInput) return;

    this.elements.taskInput.classList.remove(CSS_CLASSES.INPUT_ERROR);
    void this.elements.taskInput.offsetWidth; // Trigger reflow to restart animation
    this.elements.taskInput.classList.add(CSS_CLASSES.INPUT_ERROR);

    if (this.elements.errorMsg) {
      this.elements.errorMsg.textContent = message;
      this.elements.errorMsg.classList.remove(CSS_CLASSES.HIDDEN);
    }
  },

  /**
   * Clears error styling and alert message
   */
  clearError() {
    if (this.elements.taskInput) {
      this.elements.taskInput.classList.remove(CSS_CLASSES.INPUT_ERROR);
    }
    if (this.elements.errorMsg) {
      this.elements.errorMsg.textContent = '';
      this.elements.errorMsg.classList.add(CSS_CLASSES.HIDDEN);
    }
  },

  /**
   * Renders inline task editing mode for a specific task row
   * @param {string} taskId
   * @param {string} currentText
   */
  renderEditMode(taskId, currentText) {
    const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskEl) return;

    taskEl.classList.add(CSS_CLASSES.TASK_EDITING);
    taskEl.innerHTML = `
      <form class="task-item__edit-form" data-edit-form="${taskId}">
        <input 
          type="text" 
          class="task-item__edit-input" 
          value="${this.escapeHtml(currentText)}" 
          maxlength="${LIMITS.MAX_TASK_LENGTH}" 
          aria-label="Edit task description"
        />
        <div class="task-item__edit-actions">
          <button type="submit" class="task-item__edit-btn task-item__edit-btn--save" title="Save changes (Enter)">Save</button>
          <button type="button" class="task-item__edit-btn task-item__edit-btn--cancel" data-action="cancel-edit" title="Cancel (Esc)">Cancel</button>
        </div>
      </form>
    `;

    const input = taskEl.querySelector('.task-item__edit-input');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  },

  /**
   * Displays the current date in human-friendly format
   */
  renderCurrentDate() {
    if (!this.elements.currentDate) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    this.elements.currentDate.textContent = now.toLocaleDateString(undefined, options);
  },

  /**
   * Formats ISO timestamp to human-friendly relative time
   * @param {string} isoString
   * @returns {string}
   */
  formatRelativeTime(isoString) {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  },

  /**
   * Toggles shortcuts modal
   * @param {boolean} show
   */
  toggleShortcutsModal(show) {
    if (!this.elements.shortcutsModal) return;
    this.elements.shortcutsModal.classList.toggle(CSS_CLASSES.HIDDEN, !show);
  },

  /**
   * Toggles the Preferences & Appearance Settings modal
   * @param {boolean} show
   */
  toggleSettingsModal(show) {
    if (!this.elements.settingsModal) return;
    this.elements.settingsModal.classList.toggle(CSS_CLASSES.HIDDEN, !show);
  },

  /**
   * Displays the delete confirmation dialog with the task description
   * @param {string} taskText
   */
  showDeleteConfirm(taskText) {
    if (!this.elements.deleteModal) return;

    if (this.elements.deleteModalDesc) {
      this.elements.deleteModalDesc.innerHTML = `Are you sure you want to delete <span class="task-preview-name">"${this.escapeHtml(taskText)}"</span>? This action cannot be undone.`;
    }
    this.elements.deleteModal.classList.remove(CSS_CLASSES.HIDDEN);

    // Focus cancel button for safe keyboard defaults
    if (this.elements.cancelDeleteBtn) {
      this.elements.cancelDeleteBtn.focus();
    }
  },

  /**
   * Hides the delete confirmation dialog
   */
  hideDeleteConfirm() {
    if (!this.elements.deleteModal) return;
    this.elements.deleteModal.classList.add(CSS_CLASSES.HIDDEN);
  },

  /**
   * Applies all user customization settings to the document root and updates modal controls
   * @param {Object} settings
   */
  applySettings(settings) {
    if (!settings) return;

    // 1. Resolve Dark Mode (system / light / dark)
    let resolvedTheme = settings.darkMode;
    if (settings.darkMode === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolvedTheme);

    // Update quick theme toggle icon
    if (this.elements.themeToggle) {
      this.elements.themeToggle.setAttribute(
        'title',
        `Current: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode (Click to toggle)`
      );
    }

    // 2. Apply Accent Color Theme
    const accent = settings.themeColor || 'violet';
    document.documentElement.setAttribute('data-accent', accent);

    // 3. Apply Typography Font Family
    const font = settings.fontFamily || 'inter';
    document.documentElement.setAttribute('data-font', font);

    // 4. Apply Font Size Scale
    const size = settings.fontSize || 'normal';
    document.documentElement.setAttribute('data-size', size);

    // 5. Apply Background Preset
    const bg = settings.backgroundStyle || 'glow';
    document.documentElement.setAttribute('data-bg', bg);

    // 6. Update Active States on Settings Modal Controls
    if (this.elements.themeModeBtns) {
      this.elements.themeModeBtns.forEach((btn) => {
        const isActive = btn.dataset.themeMode === settings.darkMode;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    if (this.elements.accentColorBtns) {
      this.elements.accentColorBtns.forEach((btn) => {
        const isActive = btn.dataset.accent === accent;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    if (this.elements.fontFamilyBtns) {
      this.elements.fontFamilyBtns.forEach((btn) => {
        const isActive = btn.dataset.font === font;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    if (this.elements.fontSizeBtns) {
      this.elements.fontSizeBtns.forEach((btn) => {
        const isActive = btn.dataset.fontSize === size;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    if (this.elements.bgStyleBtns) {
      this.elements.bgStyleBtns.forEach((btn) => {
        const isActive = btn.dataset.bgStyle === bg;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }
  },

  /**
   * Helper to sanitize string for safe DOM insertion
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  /**
   * Displays a transient, non-intrusive toast notification
   * @param {string} message
   */
  showToast(message) {
    let toast = document.querySelector('.app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('show');
    // Force DOM reflow so re-triggering animation works smoothly
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  },
};

