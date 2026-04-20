-- =============================================
-- Initra — Database Schema Migration
-- Schema: initra (custom schema on Supabase)
-- Full schema for wizard sessions, community, and agent files
-- =============================================

-- Create the initra schema (if not already created via dashboard)
CREATE SCHEMA IF NOT EXISTS initra;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Grant usage on the initra schema to relevant roles
GRANT USAGE ON SCHEMA initra TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA initra TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA initra TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA initra TO anon;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA initra GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA initra GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA initra GRANT SELECT ON TABLES TO anon;

-- Expose the schema through PostgREST
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, initra';
NOTIFY pgrst, 'reload config';

-- ── Profiles ────────────────────────────────────
-- Extends Supabase auth.users
CREATE TABLE IF NOT EXISTS initra.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  projects_created INTEGER DEFAULT 0,
  community_karma INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION initra.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO initra.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initra.handle_new_user();

-- ── Project Templates ───────────────────────────
-- Pre-defined project configurations (seeded data)
CREATE TABLE IF NOT EXISTS initra.project_templates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon_emoji TEXT,
  default_stack JSONB DEFAULT '{}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON initra.project_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON initra.project_templates(slug);

-- ── Template Stack Options ──────────────────────
-- Dynamic form fields per template
CREATE TABLE IF NOT EXISTS initra.template_stack_options (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES initra.project_templates(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('select', 'multi-select', 'toggle', 'text')),
  options JSONB DEFAULT '[]'::jsonb,
  default_value JSONB,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  section TEXT DEFAULT 'core' CHECK (section IN ('core', 'advanced')),
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_stack_options_template ON initra.template_stack_options(template_id);

-- ── IDE Targets ─────────────────────────────────
-- Supported IDE configurations
CREATE TABLE IF NOT EXISTS initra.ide_targets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  config_filename TEXT NOT NULL,
  config_format TEXT,
  config_path TEXT NOT NULL,
  template_structure JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── Wizard Sessions ─────────────────────────────
-- Each completed wizard run
CREATE TABLE IF NOT EXISTS initra.wizard_sessions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES initra.profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES initra.project_templates(id) ON DELETE SET NULL,
  project_name TEXT,
  stack_config JSONB DEFAULT '{}'::jsonb,
  selected_ides TEXT[] DEFAULT '{}',
  generated_config JSONB DEFAULT '{}'::jsonb,
  share_slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON initra.wizard_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_share ON initra.wizard_sessions(share_slug);

-- ── Generated Files ─────────────────────────────
-- Output files from prompt engine
CREATE TABLE IF NOT EXISTS initra.generated_files (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES initra.wizard_sessions(id) ON DELETE CASCADE,
  ide_target TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generated_session ON initra.generated_files(session_id);

-- ── Community Projects ──────────────────────────
-- User-suggested open source projects
CREATE TABLE IF NOT EXISTS initra.community_projects (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  suggested_by UUID REFERENCES initra.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  impact_statement TEXT,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'in_progress', 'needs_agents', 'completed', 'archived')),
  github_url TEXT,
  vote_score INTEGER DEFAULT 0,
  agent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_status ON initra.community_projects(status);
CREATE INDEX IF NOT EXISTS idx_community_votes ON initra.community_projects(vote_score DESC);
CREATE INDEX IF NOT EXISTS idx_community_category ON initra.community_projects(category);

-- ── Project Votes ───────────────────────────────
-- Upvote/downvote on community projects
CREATE TABLE IF NOT EXISTS initra.project_votes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES initra.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES initra.community_projects(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_project ON initra.project_votes(project_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON initra.project_votes(user_id);

-- Trigger to update vote_score on community_projects
CREATE OR REPLACE FUNCTION initra.update_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE initra.community_projects
    SET vote_score = vote_score - OLD.value,
        updated_at = now()
    WHERE id = OLD.project_id;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE initra.community_projects
    SET vote_score = vote_score + NEW.value,
        updated_at = now()
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE initra.community_projects
    SET vote_score = vote_score - OLD.value + NEW.value,
        updated_at = now()
    WHERE id = NEW.project_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON initra.project_votes
    FOR EACH ROW EXECUTE FUNCTION initra.update_vote_score();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Agent Contributions ─────────────────────────
-- Community-submitted agent config files
CREATE TABLE IF NOT EXISTS initra.agent_contributions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES initra.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES initra.community_projects(id) ON DELETE CASCADE,
  ide_target TEXT NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contributions_project ON initra.agent_contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON initra.agent_contributions(user_id);

-- Trigger to update agent_count on community_projects
CREATE OR REPLACE FUNCTION initra.update_agent_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE initra.community_projects
  SET agent_count = (
    SELECT COUNT(*) FROM initra.agent_contributions
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND status = 'approved'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_contribution_change
    AFTER INSERT OR UPDATE OR DELETE ON initra.agent_contributions
    FOR EACH ROW EXECUTE FUNCTION initra.update_agent_count();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Prompt Templates ────────────────────────────
-- Stored templates for the generation engine
CREATE TABLE IF NOT EXISTS initra.prompt_templates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  ide_slug TEXT NOT NULL,
  project_category TEXT NOT NULL,
  template_body TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (ide_slug, project_category, version)
);

CREATE INDEX IF NOT EXISTS idx_prompt_templates_lookup ON initra.prompt_templates(ide_slug, project_category, is_active);

-- ── Row Level Security ──────────────────────────

-- Profiles: users can read all, update own
ALTER TABLE initra.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Public profiles are viewable by everyone" ON initra.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON initra.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Project Templates: public read
ALTER TABLE initra.project_templates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Templates are viewable by everyone" ON initra.project_templates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Template Stack Options: public read
ALTER TABLE initra.template_stack_options ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Stack options are viewable by everyone" ON initra.template_stack_options FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- IDE Targets: public read
ALTER TABLE initra.ide_targets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "IDE targets are viewable by everyone" ON initra.ide_targets FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Wizard Sessions: users can CRUD own, read public
ALTER TABLE initra.wizard_sessions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own sessions" ON initra.wizard_sessions FOR SELECT USING (auth.uid() = user_id OR is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can create sessions" ON initra.wizard_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Anonymous sessions allowed" ON initra.wizard_sessions FOR INSERT WITH CHECK (user_id IS NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Generated Files: viewable if session is accessible
ALTER TABLE initra.generated_files ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Files viewable with session access" ON initra.generated_files FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM initra.wizard_sessions ws
      WHERE ws.id = session_id
      AND (ws.user_id = auth.uid() OR ws.is_public = true)
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Files insertable by session owner" ON initra.generated_files FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM initra.wizard_sessions ws
      WHERE ws.id = session_id
      AND (ws.user_id = auth.uid() OR ws.user_id IS NULL)
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Community Projects: public read, authenticated create
ALTER TABLE initra.community_projects ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Community projects are viewable by everyone" ON initra.community_projects FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Authenticated users can suggest projects" ON initra.community_projects FOR INSERT WITH CHECK (auth.uid() = suggested_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own projects" ON initra.community_projects FOR UPDATE USING (auth.uid() = suggested_by);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Project Votes: authenticated CRUD own
ALTER TABLE initra.project_votes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own votes" ON initra.project_votes FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can cast votes" ON initra.project_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can change own votes" ON initra.project_votes FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can remove own votes" ON initra.project_votes FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Agent Contributions: public read, authenticated create
ALTER TABLE initra.agent_contributions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Contributions are viewable by everyone" ON initra.agent_contributions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can submit contributions" ON initra.agent_contributions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own contributions" ON initra.agent_contributions FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Prompt Templates: public read
ALTER TABLE initra.prompt_templates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Prompt templates are viewable" ON initra.prompt_templates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
