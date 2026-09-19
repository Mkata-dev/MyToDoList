/**
 * main.js
 * Layer 4: Controller Layer
 * Orchestrates layers, attaches delegated event listeners, and bootstraps the application.
 * Architecture Reference: architecture.md (Section 3, 4, 8, 11)
 */

const App = {
  currentFilter: FILTERS.ALL,
  searchQuery: '',
  editingTaskId: null,
  pendingDeleteTaskId: null,
  draggedTaskId: null,

  // User Customization Settings State
  settings: {
    darkMode: 'dark', // 'system' | 'light' | 'dark'
    themeColor: 'violet', // 'violet' | 'emerald' | 'cyan' | 'amber' | 'rose'
    fontFamily: 'inter', // 'inter' | 'outfit' | 'serif' | 'mono'
    fontSize: 'normal', // 'compact' | 'normal' | 'large'
    backgroundStyle: 'glow', // 'glow' | 'dots' | 'gradient' | 'solid'
  },

  /**
   * Initializes the application upon DOM ready
   */
  init() {
    UIManager.initElements();

    // 1. Initialize Settings (saved preferences or defaults)
    this.initSettings();

    // 2. Load stored tasks from Data Layer into Business Logic Layer
    const loadedTasks = StorageManager.getAll();
    TaskManager.init(loadedTasks);

    // 3. Restore last-selected filter (PRD Section 4)
    const savedFilter = StorageManager.getFilter();
    if (savedFilter && Object.values(FILTERS).includes(savedFilter)) {
      this.currentFilter = savedFilter;
    }

    // 4. Render initial date & view
    UIManager.renderCurrentDate();
    this.renderCurrentView();

    // 5. Register event listeners via delegation
    this.attachEventListeners();

    // 6. Initialize Supabase Auth & header profile widget
    this.initAuth();
  },

  /**
   * Renders the current view state based on filter & search query
   */
  renderCurrentView() {
    const tasks = TaskManager.getFilteredTasks(this.currentFilter, this.searchQuery);
    const stats = TaskManager.getTaskStats();
    UIManager.render(tasks, stats, this.currentFilter);
  },

  /**
   * Attaches centralized event listeners using event delegation
   */
  attachEventListeners() {
    // Add task form submission
    if (UIManager.elements.taskForm) {
      UIManager.elements.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddTask();
      });
    }

    // Clear error on input typing
    if (UIManager.elements.taskInput) {
      UIManager.elements.taskInput.addEventListener('input', () => {
        UIManager.clearError();
      });
    }

    // Filter tabs delegation
    if (UIManager.elements.filterBtns) {
      UIManager.elements.filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const filter = e.currentTarget.dataset.filter;
          if (filter) this.handleFilterChange(filter);
        });
      });
    }

    // Clear completed button
    if (UIManager.elements.clearBtn) {
      UIManager.elements.clearBtn.addEventListener('click', () => {
        this.handleClearCompleted();
      });
    }

    // Task list event delegation (checkbox toggle, delete, edit)
    if (UIManager.elements.taskList) {
      // Click delegation
      UIManager.elements.taskList.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.dataset.action;
        const taskItem = actionBtn.closest('[data-task-id]');
        if (!taskItem) return;

        const taskId = taskItem.dataset.taskId;

        if (action === 'toggle') {
          this.closeAllTaskMenus();
          this.handleToggleTask(taskId);
        } else if (action === 'pin') {
          this.closeAllTaskMenus();
          this.handleTogglePin(taskId);
        } else if (action === 'toggle-menu') {
          e.stopPropagation();
          const menuWrapper = actionBtn.closest('.task-item__menu-wrapper');
          const menu = menuWrapper ? menuWrapper.querySelector('.task-dropdown-menu') : null;
          if (menu) {
            const isOpen = !menu.classList.contains('hidden');
            this.closeAllTaskMenus();
            if (!isOpen) {
              menu.classList.remove('hidden');
            }
          }
        } else if (action === 'copy') {
          this.closeAllTaskMenus();
          this.handleCopyTask(taskId);
        } else if (action === 'cycle-priority') {
          this.closeAllTaskMenus();
          this.handleCyclePriority(taskId);
        } else if (action === 'delete') {
          this.closeAllTaskMenus();
          this.requestDeleteTask(taskId);
        } else if (action === 'edit') {
          this.closeAllTaskMenus();
          this.handleStartEdit(taskId);
        } else if (action === 'cancel-edit') {
          this.handleCancelEdit();
        }
      });

      // Double-click to edit delegation
      UIManager.elements.taskList.addEventListener('dblclick', (e) => {
        const textEl = e.target.closest('.task-item__text');
        if (!textEl) return;
        const taskItem = textEl.closest('[data-task-id]');
        if (taskItem) this.handleStartEdit(taskItem.dataset.taskId);
      });

      // Edit form submit delegation
      UIManager.elements.taskList.addEventListener('submit', (e) => {
        const form = e.target.closest('[data-edit-form]');
        if (!form) return;
        e.preventDefault();
        const taskId = form.dataset.editForm;
        const input = form.querySelector('.task-item__edit-input');
        if (input) this.handleSaveEdit(taskId, input.value);
      });

      // Keyboard shortcuts inside edit form (Escape to cancel)
      UIManager.elements.taskList.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.editingTaskId) {
          this.handleCancelEdit();
        }
      });

      // ====================================================================
      // Desktop HTML5 Drag and Drop Reordering
      // ====================================================================
      UIManager.elements.taskList.addEventListener('dragstart', (e) => {
        const item = e.target.closest('[data-task-id]');
        if (!item) return;

        this.closeAllTaskMenus();
        this.draggedTaskId = item.dataset.taskId;
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', this.draggedTaskId);
          e.dataTransfer.effectAllowed = 'move';
        }

        requestAnimationFrame(() => {
          item.classList.add(CSS_CLASSES.TASK_DRAGGING);
        });
      });

      UIManager.elements.taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }

        const targetItem = e.target.closest('[data-task-id]');
        if (!targetItem || targetItem.dataset.taskId === this.draggedTaskId) return;

        const rect = targetItem.getBoundingClientRect();
        const offset = e.clientY - rect.top;
        const isTop = offset < rect.height / 2;

        document.querySelectorAll(`.${CSS_CLASSES.TASK_DRAG_OVER_TOP}, .${CSS_CLASSES.TASK_DRAG_OVER_BOTTOM}`).forEach((el) => {
          if (el !== targetItem) {
            el.classList.remove(CSS_CLASSES.TASK_DRAG_OVER_TOP, CSS_CLASSES.TASK_DRAG_OVER_BOTTOM);
          }
        });

        targetItem.classList.toggle(CSS_CLASSES.TASK_DRAG_OVER_TOP, isTop);
        targetItem.classList.toggle(CSS_CLASSES.TASK_DRAG_OVER_BOTTOM, !isTop);
      });

      UIManager.elements.taskList.addEventListener('dragleave', (e) => {
        const targetItem = e.target.closest('[data-task-id]');
        if (targetItem && !targetItem.contains(e.relatedTarget)) {
          targetItem.classList.remove(CSS_CLASSES.TASK_DRAG_OVER_TOP, CSS_CLASSES.TASK_DRAG_OVER_BOTTOM);
        }
      });

      UIManager.elements.taskList.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetItem = e.target.closest('[data-task-id]');

        if (targetItem && this.draggedTaskId && targetItem.dataset.taskId !== this.draggedTaskId) {
          const isTop = targetItem.classList.contains(CSS_CLASSES.TASK_DRAG_OVER_TOP);
          const position = isTop ? 'before' : 'after';

          const moved = TaskManager.moveTask(this.draggedTaskId, targetItem.dataset.taskId, position);
          if (moved) {
            StorageManager.save(TaskManager.getTasks());
            this.renderCurrentView();
          }
        }

        this.cleanupDragStates();
      });

      UIManager.elements.taskList.addEventListener('dragend', () => {
        this.cleanupDragStates();
      });

      // ====================================================================
      // Touch Drag Support for Mobile Devices
      // ====================================================================
      let touchDraggedItem = null;
      let touchTargetItem = null;
      let touchDropPosition = 'before';

      UIManager.elements.taskList.addEventListener('touchstart', (e) => {
        const handle = e.target.closest('.task-item__drag-handle');
        if (!handle) return;

        this.closeAllTaskMenus();
        touchDraggedItem = handle.closest('[data-task-id]');
        if (touchDraggedItem) {
          this.draggedTaskId = touchDraggedItem.dataset.taskId;
          touchDraggedItem.classList.add(CSS_CLASSES.TASK_DRAGGING);
        }
      }, { passive: true });

      UIManager.elements.taskList.addEventListener('touchmove', (e) => {
        if (!touchDraggedItem) return;

        const touch = e.touches[0];
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!elementUnderTouch) return;

        const targetItem = elementUnderTouch.closest('[data-task-id]');
        if (!targetItem || targetItem === touchDraggedItem) return;

        touchTargetItem = targetItem;
        const rect = targetItem.getBoundingClientRect();
        const isTop = (touch.clientY - rect.top) < rect.height / 2;
        touchDropPosition = isTop ? 'before' : 'after';

        document.querySelectorAll(`.${CSS_CLASSES.TASK_DRAG_OVER_TOP}, .${CSS_CLASSES.TASK_DRAG_OVER_BOTTOM}`).forEach((el) => {
          if (el !== targetItem) {
            el.classList.remove(CSS_CLASSES.TASK_DRAG_OVER_TOP, CSS_CLASSES.TASK_DRAG_OVER_BOTTOM);
          }
        });

        targetItem.classList.toggle(CSS_CLASSES.TASK_DRAG_OVER_TOP, isTop);
        targetItem.classList.toggle(CSS_CLASSES.TASK_DRAG_OVER_BOTTOM, !isTop);
      }, { passive: false });

      UIManager.elements.taskList.addEventListener('touchend', () => {
        if (touchDraggedItem && touchTargetItem && touchDraggedItem !== touchTargetItem) {
          const moved = TaskManager.moveTask(
            touchDraggedItem.dataset.taskId,
            touchTargetItem.dataset.taskId,
            touchDropPosition
          );
          if (moved) {
            StorageManager.save(TaskManager.getTasks());
            this.renderCurrentView();
          }
        }
        touchDraggedItem = null;
        touchTargetItem = null;
        this.cleanupDragStates();
      });
    }

    // Real-time search filter
    if (UIManager.elements.searchInput) {
      UIManager.elements.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderCurrentView();
      });
    }

    // Theme toggle button (quick one-click toggle)
    if (UIManager.elements.themeToggle) {
      UIManager.elements.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Settings modal open/close
    if (UIManager.elements.settingsBtn) {
      UIManager.elements.settingsBtn.addEventListener('click', () => {
        UIManager.toggleSettingsModal(true);
      });
    }
    if (UIManager.elements.settingsCloseBtn) {
      UIManager.elements.settingsCloseBtn.addEventListener('click', () => {
        UIManager.toggleSettingsModal(false);
      });
    }

    // Settings options delegation (Dark Mode, Accent Color, Text Style, Background)
    if (UIManager.elements.settingsModal) {
      UIManager.elements.settingsModal.addEventListener('click', (e) => {
        // 1. Dark Mode option
        const themeBtn = e.target.closest('.theme-mode-btn');
        if (themeBtn && themeBtn.dataset.themeMode) {
          this.updateSetting('darkMode', themeBtn.dataset.themeMode);
          return;
        }

        // 2. Accent Color option
        const accentBtn = e.target.closest('.accent-color-btn');
        if (accentBtn && accentBtn.dataset.accent) {
          this.updateSetting('themeColor', accentBtn.dataset.accent);
          return;
        }

        // 3. Font Family option
        const fontBtn = e.target.closest('.font-family-btn');
        if (fontBtn && fontBtn.dataset.font) {
          this.updateSetting('fontFamily', fontBtn.dataset.font);
          return;
        }

        // 4. Font Size option
        const sizeBtn = e.target.closest('.font-size-btn');
        if (sizeBtn && sizeBtn.dataset.fontSize) {
          this.updateSetting('fontSize', sizeBtn.dataset.fontSize);
          return;
        }

        // 5. Background Style option
        const bgBtn = e.target.closest('.bg-style-btn');
        if (bgBtn && bgBtn.dataset.bgStyle) {
          this.updateSetting('backgroundStyle', bgBtn.dataset.bgStyle);
          return;
        }

        // Click on outer backdrop closes modal
        if (e.target === UIManager.elements.settingsModal) {
          UIManager.toggleSettingsModal(false);
        }
      });
    }

    // Shortcuts modal open/close
    if (UIManager.elements.shortcutsBtn) {
      UIManager.elements.shortcutsBtn.addEventListener('click', () => {
        UIManager.toggleShortcutsModal(true);
      });
    }
    if (UIManager.elements.modalCloseBtn) {
      UIManager.elements.modalCloseBtn.addEventListener('click', () => {
        UIManager.toggleShortcutsModal(false);
      });
    }

    // Click outside shortcuts modal closes it
    if (UIManager.elements.shortcutsModal) {
      UIManager.elements.shortcutsModal.addEventListener('click', (e) => {
        if (e.target === UIManager.elements.shortcutsModal) {
          UIManager.toggleShortcutsModal(false);
        }
      });
    }

    // Delete Confirmation modal buttons
    if (UIManager.elements.confirmDeleteBtn) {
      UIManager.elements.confirmDeleteBtn.addEventListener('click', () => {
        this.confirmDeleteTask();
      });
    }
    if (UIManager.elements.cancelDeleteBtn) {
      UIManager.elements.cancelDeleteBtn.addEventListener('click', () => {
        this.cancelDeleteTask();
      });
    }

    // Click outside delete modal closes it
    if (UIManager.elements.deleteModal) {
      UIManager.elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === UIManager.elements.deleteModal) {
          this.cancelDeleteTask();
        }
      });
    }

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Escape closes any open modal or dropdown menu
      if (e.key === 'Escape') {
        this.closeAllTaskMenus();
        UIManager.toggleShortcutsModal(false);
        UIManager.toggleSettingsModal(false);
        this.cancelDeleteTask();
      }
      // '?' or 'Ctrl + /' opens shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        UIManager.toggleShortcutsModal(true);
      }
    });

    // Listen to OS system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.settings.darkMode === 'system') {
        UIManager.applySettings(this.settings);
      }
    });

    // Dismiss task action dropdown menus when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.task-item__menu-wrapper')) {
        this.closeAllTaskMenus();
      }
    });
  },

  /**
   * Handles adding a new task
   */
  handleAddTask() {
    const text = UIManager.elements.taskInput ? UIManager.elements.taskInput.value : '';
    const priority = UIManager.elements.prioritySelect ? UIManager.elements.prioritySelect.value : 'none';
    const result = TaskManager.createTask(text, priority);

    if (!result.success) {
      UIManager.showError(result.error);
      return;
    }

    // Persist to storage
    const saved = StorageManager.save(TaskManager.getTasks());
    if (!saved) {
      UIManager.showError(MESSAGES.ERROR_STORAGE);
      return;
    }

    UIManager.clearInput();
    this.renderCurrentView();
  },

  /**
   * Handles toggling task completion
   * @param {string} id
   */
  handleToggleTask(id) {
    const result = TaskManager.toggleTask(id);
    if (!result.success) return;

    StorageManager.save(TaskManager.getTasks());
    this.renderCurrentView();
  },

  /**
   * Handles toggling the pinned status of a task
   * @param {string} id
   */
  handleTogglePin(id) {
    const result = TaskManager.togglePinTask(id);
    if (!result.success) return;

    StorageManager.save(TaskManager.getTasks());
    this.renderCurrentView();
    if (result.task) {
      UIManager.showToast(result.task.pinned ? 'Task pinned to top' : 'Task unpinned');
    }
  },

  /**
   * Handles cycling task priority
   * @param {string} id
   */
  handleCyclePriority(id) {
    const result = TaskManager.cyclePriority(id);
    if (!result.success) return;

    StorageManager.save(TaskManager.getTasks());
    this.renderCurrentView();
    const pLabel = result.task.priority !== 'none' ? result.task.priority.toUpperCase() : 'Normal';
    UIManager.showToast(`Priority: ${pLabel}`);
  },

  /**
   * Copies task description to clipboard
   * @param {string} id
   */
  handleCopyTask(id) {
    const task = TaskManager.getTasks().find((t) => t.id === id);
    if (!task) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(task.text)
        .then(() => UIManager.showToast('Task copied to clipboard'))
        .catch(() => UIManager.showToast('Failed to copy task'));
    } else {
      UIManager.showToast('Clipboard copy not supported');
    }
  },

  /**
   * Closes any open three-dots dropdown menus across all task items
   */
  closeAllTaskMenus() {
    document.querySelectorAll('.task-dropdown-menu:not(.hidden)').forEach((menu) => {
      menu.classList.add('hidden');
    });
  },

  /**
   * Requests confirmation before deleting a task
   * @param {string} id
   */
  requestDeleteTask(id) {
    const task = TaskManager.getTasks().find((t) => t.id === id);
    if (!task) return;
    this.pendingDeleteTaskId = id;
    UIManager.showDeleteConfirm(task.text);
  },

  /**
   * Confirms and executes task deletion
   */
  confirmDeleteTask() {
    if (!this.pendingDeleteTaskId) return;
    const id = this.pendingDeleteTaskId;
    this.pendingDeleteTaskId = null;
    UIManager.hideDeleteConfirm();
    this.handleDeleteTask(id);
  },

  /**
   * Cancels pending task deletion
   */
  cancelDeleteTask() {
    this.pendingDeleteTaskId = null;
    UIManager.hideDeleteConfirm();
  },

  /**
   * Handles deleting a task with smooth animation
   * @param {string} id
   */
  handleDeleteTask(id) {
    UIManager.removeTask(id, () => {
      TaskManager.deleteTask(id);
      StorageManager.save(TaskManager.getTasks());
      this.renderCurrentView();
    });
  },

  /**
   * Initiates inline task editing
   * @param {string} id
   */
  handleStartEdit(id) {
    const task = TaskManager.getTasks().find((t) => t.id === id);
    if (!task) return;
    this.editingTaskId = id;
    UIManager.renderEditMode(id, task.text);
  },

  /**
   * Saves edited task text
   * @param {string} id
   * @param {string} newText
   */
  handleSaveEdit(id, newText) {
    const result = TaskManager.editTask(id, newText);
    if (!result.success) {
      alert(result.error);
      return;
    }

    this.editingTaskId = null;
    StorageManager.save(TaskManager.getTasks());
    this.renderCurrentView();
  },

  /**
   * Cancels active inline editing
   */
  handleCancelEdit() {
    this.editingTaskId = null;
    this.renderCurrentView();
  },

  /**
   * Changes active task filter
   * @param {string} filter
   */
  handleFilterChange(filter) {
    this.currentFilter = filter;
    StorageManager.setFilter(filter);
    this.renderCurrentView();
  },

  /**
   * Clears all completed tasks
   */
  handleClearCompleted() {
    const result = TaskManager.clearCompleted();
    if (result.success) {
      StorageManager.save(TaskManager.getTasks());
      this.renderCurrentView();
    }
  },

  /**
   * Initializes all user customization settings from storage or defaults
   */
  initSettings() {
    const saved = StorageManager.getSettings();
    const savedLegacyTheme = StorageManager.getTheme();

    if (saved) {
      this.settings = { ...this.settings, ...saved };
    } else if (savedLegacyTheme) {
      this.settings.darkMode = savedLegacyTheme;
    }

    UIManager.applySettings(this.settings);
  },

  /**
   * Updates an individual setting, persists to storage, and applies to DOM immediately
   * @param {string} key
   * @param {string} value
   */
  updateSetting(key, value) {
    this.settings[key] = value;
    StorageManager.saveSettings(this.settings);
    UIManager.applySettings(this.settings);
  },

  /**
   * Quick toggle between light and dark themes (from the header icon)
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextMode = currentTheme === 'dark' ? 'light' : 'dark';
    this.updateSetting('darkMode', nextMode);
  },

  /**
   * Cleans up all visual drag and drop state classes from DOM
   */
  cleanupDragStates() {
    this.draggedTaskId = null;
    document.querySelectorAll(`.${CSS_CLASSES.TASK_DRAGGING}, .${CSS_CLASSES.TASK_DRAG_OVER_TOP}, .${CSS_CLASSES.TASK_DRAG_OVER_BOTTOM}`).forEach((el) => {
      el.classList.remove(CSS_CLASSES.TASK_DRAGGING, CSS_CLASSES.TASK_DRAG_OVER_TOP, CSS_CLASSES.TASK_DRAG_OVER_BOTTOM);
    });
  },

  /**
   * Initializes Supabase Auth session listener and binds user header controls
   */
  async initAuth() {
    if (!window.AuthManager) return;

    try {
      // 1. Initial Session Check
      const session = await window.AuthManager.getSession();
      await this.updateUserHeaderUI(session?.user || null);

      // 2. Auth State Change Listener
      window.AuthManager.onAuthStateChange(async (event, newSession) => {
        await this.updateUserHeaderUI(newSession?.user || null);
      });
    } catch (err) {
      console.warn('TaskFlow: Auth initialization note:', err);
    }

    // 3. User Avatar Click -> Toggle Dropdown Menu
    const avatarBtn = document.getElementById('userAvatarBtn');
    const profileMenu = document.getElementById('userProfileMenu');

    if (avatarBtn && profileMenu) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = profileMenu.classList.contains('hidden');
        profileMenu.classList.toggle('hidden', !isHidden);
        avatarBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      });

      // Close menu on click outside
      document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target) && e.target !== avatarBtn) {
          profileMenu.classList.add('hidden');
          avatarBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 4. Menu Settings Button -> Open Appearance Settings Modal
    const menuSettingsBtn = document.getElementById('menuSettingsBtn');
    if (menuSettingsBtn) {
      menuSettingsBtn.addEventListener('click', () => {
        if (profileMenu) profileMenu.classList.add('hidden');
        UIManager.toggleSettingsModal(true);
      });
    }

    // 5. Menu Sign Out Button
    const menuSignOutBtn = document.getElementById('menuSignOutBtn');
    if (menuSignOutBtn) {
      menuSignOutBtn.addEventListener('click', async () => {
        if (profileMenu) profileMenu.classList.add('hidden');
        await window.AuthManager.signOut();
        UIManager.showToast('Signed out successfully');
        await this.updateUserHeaderUI(null);
      });
    }
  },

  /**
   * Updates header controls between "Sign In" button and User Profile Avatar
   * @param {object|null} user
   */
  async updateUserHeaderUI(user) {
    const authNavBtn = document.getElementById('authNavBtn');
    const userProfileContainer = document.getElementById('userProfileContainer');
    const userAvatarText = document.getElementById('userAvatarText');
    const menuUserName = document.getElementById('menuUserName');
    const menuUserEmail = document.getElementById('menuUserEmail');

    if (!authNavBtn || !userProfileContainer) return;

    if (user) {
      authNavBtn.classList.add('hidden');
      userProfileContainer.classList.remove('hidden');

      // Fetch profile from database or fall back to user metadata
      let displayName = 'User';
      let initials = 'U';

      try {
        const profile = await window.AuthManager.getProfile(user.id);
        displayName = window.AuthManager.getDisplayName(user, profile);
        initials = window.AuthManager.getInitials(displayName);
      } catch (e) {
        if (user.email) {
          displayName = user.email.split('@')[0];
          initials = displayName.slice(0, 2).toUpperCase();
        }
      }

      if (userAvatarText) userAvatarText.textContent = initials;
      if (menuUserName) menuUserName.textContent = displayName;
      if (menuUserEmail) menuUserEmail.textContent = user.email || '';
    } else {
      authNavBtn.classList.remove('hidden');
      userProfileContainer.classList.add('hidden');
    }
  },
};

// Bootstrap app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
