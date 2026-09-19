/**
 * supabaseClient.js
 * Centralized Supabase client initialization for TaskFlow.
 * Leverages the official @supabase/supabase-js CDN bundle.
 */

const SUPABASE_CONFIG = {
  url: 'https://zcmcwspfcfxrhcscitog.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbWN3c3BmY2Z4cmhjc2NpdG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjU4NzYsImV4cCI6MjEwNTQwMTg3Nn0.QleWPNQJUz4i3EUPXRgXBG5yjII1hbVhpHr7EqnwsoE'
};

let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      try {
        supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } catch (err) {
        console.error('TaskFlow: Error initializing Supabase client:', err);
      }
    } else {
      console.warn('TaskFlow: Supabase SDK not loaded yet. Working in offline mode.');
    }
  }
  return supabaseClient;
}

// Make available globally
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabaseClient = getSupabaseClient;
