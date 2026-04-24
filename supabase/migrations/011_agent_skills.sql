-- Initra — Agent Skills
-- Reusable AI repair templates for the community.

CREATE TABLE initra.agent_skills (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL,
    category TEXT NOT NULL,
    target_framework TEXT NOT NULL,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE initra.agent_skills ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view skills" 
    ON initra.agent_skills FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create skills" 
    ON initra.agent_skills FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" 
    ON initra.agent_skills FOR UPDATE 
    USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_agent_skills_modtime
    BEFORE UPDATE ON initra.agent_skills
    FOR EACH ROW EXECUTE FUNCTION initra.update_modified_column();
