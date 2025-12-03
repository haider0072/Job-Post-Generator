-- Fix Schema: Change user_id from UUID to TEXT
-- This is needed because we're using Google OAuth directly, not Supabase Auth

-- Drop existing tables (this will delete data!)
DROP TABLE IF EXISTS job_posts CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- TABLE: user_profiles (FIXED)
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Changed from UUID to TEXT
  gemini_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- TABLE: organizations (FIXED)
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Changed from UUID to TEXT

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  location TEXT,
  company_size TEXT,

  -- Contact Info
  website TEXT,
  email TEXT,

  -- Branding
  logo_url TEXT,

  -- LinkedIn Integration
  linkedin_url TEXT,
  linkedin_data JSONB,

  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_organizations_user_id ON organizations(user_id);

-- =====================================================
-- TABLE: job_posts (FIXED)
-- =====================================================
CREATE TABLE job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Changed from UUID to TEXT
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT,

  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX idx_job_posts_org_id ON job_posts(organization_id);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- Note: Since we're not using Supabase Auth, RLS policies won't work as expected
-- We'll handle security in the backend using service_role key

-- Basic policies (for future Supabase Auth integration)
CREATE POLICY "Enable all for service role" ON user_profiles FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON organizations FOR ALL USING (true);
CREATE POLICY "Enable all for service role" ON job_posts FOR ALL USING (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Schema fixed! user_id is now TEXT type.';
  RAISE NOTICE '📋 All tables recreated successfully.';
END $$;
