-- ============================================================================
-- TaskFlow (To-Do List App) — Production Supabase Database Schema
-- Architecture Reference: architecture.md, prd.md, pages.md
-- Database Engine: PostgreSQL 15+ / Supabase
-- Security Model: Row Level Security (RLS) with (SELECT auth.uid()) InitPlan caching
-- Realtime Support: Enabled via supabase_realtime publication
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. UTILITY FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------
-- Automatically updates the updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict execution permissions on internal trigger function
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. TABLES DEFINITIONS
-- ----------------------------------------------------------------------------

-- Table: public.task_lists (Categories / Workspaces)
CREATE TABLE IF NOT EXISTS public.task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 60),
  color VARCHAR(32) DEFAULT '#6366f1',
  icon VARCHAR(32) DEFAULT 'list',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.tasks (Core To-Do Items)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  list_id UUID REFERENCES public.task_lists(id) ON DELETE SET NULL,
  text TEXT NOT NULL CHECK (char_length(trim(text)) > 0 AND char_length(text) <= 200),
  completed BOOLEAN NOT NULL DEFAULT false,
  pinned BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
  order_index INTEGER NOT NULL DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Generated full-text search vector for instant instant search queries
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', coalesce(text, ''))) STORED
);

-- Table: public.task_preferences (User Interface & Ergonomics Customizations)
CREATE TABLE IF NOT EXISTS public.task_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode TEXT NOT NULL DEFAULT 'dark' CHECK (dark_mode IN ('dark', 'light', 'system')),
  theme_color TEXT NOT NULL DEFAULT 'violet' CHECK (theme_color IN ('violet', 'emerald', 'cyan', 'amber', 'rose')),
  font_family TEXT NOT NULL DEFAULT 'inter' CHECK (font_family IN ('inter', 'outfit', 'serif', 'mono')),
  font_size TEXT NOT NULL DEFAULT 'normal' CHECK (font_size IN ('compact', 'normal', 'large')),
  background_style TEXT NOT NULL DEFAULT 'glow' CHECK (background_style IN ('glow', 'dots', 'gradient', 'solid')),
  last_active_filter TEXT NOT NULL DEFAULT 'all' CHECK (last_active_filter IN ('all', 'active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: public.profiles (Application User Profiles linked 1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. PERFORMANCE & ACCESS INDEXES
-- ----------------------------------------------------------------------------
-- Foreign key and ordered list retrieval
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_order ON public.tasks(user_id, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_filter ON public.tasks(user_id, completed, pinned);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_search ON public.tasks USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_task_lists_user_id ON public.task_lists(user_id, order_index ASC);

-- ----------------------------------------------------------------------------
-- 5. AUTOMATIC TIMESTAMP TRIGGERS
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_task_lists_updated_at ON public.task_lists;
CREATE TRIGGER set_task_lists_updated_at
  BEFORE UPDATE ON public.task_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_task_preferences_updated_at ON public.task_preferences;
CREATE TRIGGER set_task_preferences_updated_at
  BEFORE UPDATE ON public.task_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
-- Note: Uses (SELECT auth.uid()) rather than auth.uid() directly to allow
-- Postgres to cache the user ID in the query InitPlan, dramatically
-- improving query performance at scale.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_preferences ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Policies: profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- Policies: task_lists
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own task lists"
  ON public.task_lists FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own task lists"
  ON public.task_lists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own task lists"
  ON public.task_lists FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own task lists"
  ON public.task_lists FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- Policies: tasks
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      list_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.task_lists tl 
        WHERE tl.id = list_id AND tl.user_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND (
      list_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.task_lists tl 
        WHERE tl.id = list_id AND tl.user_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- Policies: task_preferences
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own preferences"
  ON public.task_preferences FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own preferences"
  ON public.task_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own preferences"
  ON public.task_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own preferences"
  ON public.task_preferences FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- 7. STORED PROCEDURES / RPC FUNCTIONS
-- ----------------------------------------------------------------------------

-- Atomically update order indices for drag and drop
CREATE OR REPLACE FUNCTION public.reorder_tasks(p_task_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  i INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  FOR i IN 1 .. array_length(p_task_ids, 1) LOOP
    UPDATE public.tasks
    SET order_index = i,
        updated_at = now()
    WHERE id = p_task_ids[i]
      AND user_id = v_user_id;
  END LOOP;
END;
$$;

-- Aggregate user statistics in a single fast query
CREATE OR REPLACE FUNCTION public.get_task_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  result JSON;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'total', 0,
      'active', 0,
      'completed', 0,
      'pinned', 0
    );
  END IF;

  SELECT json_build_object(
    'total', COUNT(*),
    'active', COUNT(*) FILTER (WHERE NOT completed),
    'completed', COUNT(*) FILTER (WHERE completed),
    'pinned', COUNT(*) FILTER (WHERE pinned)
  )
  INTO result
  FROM public.tasks
  WHERE user_id = v_user_id;

  RETURN result;
END;
$$;

-- Restrict RPC execution permissions
REVOKE EXECUTE ON FUNCTION public.reorder_tasks(UUID[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reorder_tasks(UUID[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_task_stats() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_task_stats() TO authenticated;

-- ----------------------------------------------------------------------------
-- 8. NEW USER ONBOARDING TRIGGER
-- ----------------------------------------------------------------------------
-- Automatically sets up default user preferences and an initial Inbox list on signup
CREATE OR REPLACE FUNCTION public.handle_new_taskflow_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Provision user profile
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Provision user preferences
  INSERT INTO public.task_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Provision default Inbox list
  INSERT INTO public.task_lists (user_id, name, color, icon, is_default, order_index)
  VALUES (NEW.id, 'Inbox', '#6366f1', 'inbox', true, 0)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_taskflow_user() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_taskflow ON auth.users;
CREATE TRIGGER on_auth_user_created_taskflow
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_taskflow_user();

-- ----------------------------------------------------------------------------
-- 9. SUPABASE REALTIME REPLICATION
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_lists;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_preferences;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. DOCUMENTATION COMMENTS
-- ----------------------------------------------------------------------------
COMMENT ON TABLE public.profiles IS 'Application user profiles linked 1-to-1 with auth.users for safe client querying.';
COMMENT ON TABLE public.tasks IS 'Core to-do tasks belonging to authenticated users with priority, pinning, and ordering.';
COMMENT ON COLUMN public.tasks.pinned IS 'Pins critical tasks to the top of the view.';
COMMENT ON COLUMN public.tasks.priority IS 'Priority scale: none, low, medium, high.';
COMMENT ON COLUMN public.tasks.order_index IS 'Explicit sort position for drag-and-drop reordering.';
COMMENT ON COLUMN public.tasks.search_vector IS 'Generated tsvector for fast text search querying.';

COMMENT ON TABLE public.task_lists IS 'User-defined categories and workspace lists for grouping tasks.';
COMMENT ON TABLE public.task_preferences IS 'User appearance and application ergonomics preferences persisted per user.';
