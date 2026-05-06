const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('SUPABASE_DB_URL not found in .env.local');
  process.exit(1);
}

const sql = `
-- 1. Sovereign Memory Table (Phase 29)
CREATE TABLE IF NOT EXISTS initra.sovereign_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_type TEXT NOT NULL,
    stack_decisions JSONB DEFAULT '{}',
    logic_patterns JSONB DEFAULT '{}',
    orchestration_preference TEXT,
    last_used_at TIMESTAMPTZ DEFAULT now(),
    frequency INTEGER DEFAULT 1,
    UNIQUE(user_id, project_type)
);

ALTER TABLE initra.sovereign_memory ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can manage their own sovereign memory" 
    ON initra.sovereign_memory FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Community Skills Table (Phase 30)
CREATE TABLE IF NOT EXISTS initra.community_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    ide_targets TEXT[] DEFAULT '{}',
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    vote_score INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE initra.community_skills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Anyone can view published skills" 
    ON initra.community_skills FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Creators can manage their own skills" 
    ON initra.community_skills FOR ALL USING (auth.uid() = creator_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Vote RPC
CREATE OR REPLACE FUNCTION initra.vote_community_skill(target_id UUID, vote_delta INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE initra.community_skills
    SET vote_score = vote_score + vote_delta
    WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function migrate() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to Supabase DB.');
    await client.query(sql);
    console.log('Migration successful: Sovereign Memory & Community Skills tables established.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
