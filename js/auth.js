/**
 * auth.js
 * Authentication manager for TaskFlow.
 * Handles Sign In, Sign Up, Password Reset, Profile Management, and Session Listeners.
 */

const AuthManager = {
  /**
   * Get the active Supabase client instance
   */
  getClient() {
    if (typeof window.getSupabaseClient === 'function') {
      return window.getSupabaseClient();
    }
    return null;
  },

  /**
   * Register a new user account
   * @param {string} email 
   * @param {string} password 
   * @param {string} fullName 
   * @returns {Promise<{ user: object|null, session: object|null, error: object|null }>}
   */
  async signUp(email, password, fullName) {
    const client = this.getClient();
    if (!client) {
      return { error: { message: 'Supabase client is not initialized.' } };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName ? fullName.trim() : '',
            name: fullName ? fullName.trim() : ''
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('TaskFlow Auth: Sign Up error:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Sign in existing user with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ user: object|null, session: object|null, error: object|null }>}
   */
  async signIn(email, password) {
    const client = this.getClient();
    if (!client) {
      return { error: { message: 'Supabase client is not initialized.' } };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('TaskFlow Auth: Sign In error:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Sign out the active user session
   */
  async signOut() {
    const client = this.getClient();
    if (!client) return { error: null };

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('TaskFlow Auth: Sign Out error:', err);
      return { error: err };
    }
  },

  /**
   * Send a password reset email
   * @param {string} email 
   */
  async resetPassword(email) {
    const client = this.getClient();
    if (!client) {
      return { error: { message: 'Supabase client is not initialized.' } };
    }

    try {
      const redirectUrl = window.location.origin + '/auth.html#reset';
      const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('TaskFlow Auth: Reset Password error:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Update password for user (e.g. after password reset link)
   * @param {string} newPassword 
   */
  async updatePassword(newPassword) {
    const client = this.getClient();
    if (!client) {
      return { error: { message: 'Supabase client is not initialized.' } };
    }

    try {
      const { data, error } = await client.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('TaskFlow Auth: Update password error:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Get active session
   */
  async getSession() {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data } = await client.auth.getSession();
      return data?.session || null;
    } catch (err) {
      console.warn('TaskFlow Auth: getSession error:', err);
      return null;
    }
  },

  /**
   * Get current authenticated user
   */
  async getUser() {
    const client = this.getClient();
    if (!client) return null;

    try {
      const { data } = await client.auth.getUser();
      return data?.user || null;
    } catch (err) {
      console.warn('TaskFlow Auth: getUser error:', err);
      return null;
    }
  },

  /**
   * Fetch user profile from public.profiles
   * @param {string} userId 
   */
  async getProfile(userId) {
    const client = this.getClient();
    if (!client || !userId) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('TaskFlow Auth: getProfile error:', err);
      return null;
    }
  },

  /**
   * Listen for session changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, etc.)
   * @param {Function} callback (event, session) => void
   */
  onAuthStateChange(callback) {
    const client = this.getClient();
    if (!client || typeof callback !== 'function') return null;

    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return authListener?.subscription || null;
  },

  /**
   * Utility: Get clean display name from user or profile
   */
  getDisplayName(user, profile) {
    if (profile?.display_name) return profile.display_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  },

  /**
   * Utility: Get user initials for avatar
   */
  getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
};

// Make available globally
window.AuthManager = AuthManager;
