-- JobCraft AI Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: user_profiles
-- Stores user-specific data including encrypted API key
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gemini_api_key TEXT, -- Encrypted Gemini API key
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- TABLE: organizations
-- Stores company/organization information
-- =====================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

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
  linkedin_data JSONB, -- Store full LinkedIn scrape response

  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One organization per user (can be changed for multi-org support)
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX idx_organizations_user_id ON organizations(user_id);

-- =====================================================
-- TABLE: job_posts (Optional - for history tracking)
-- Stores generated job posts
-- =====================================================
CREATE TABLE job_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Job Post Data
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT, -- Original user prompt

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for faster queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX idx_job_posts_org_id ON job_posts(organization_id);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER_PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================

-- Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own organization
CREATE POLICY "Users can insert own organization"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own organization
CREATE POLICY "Users can update own organization"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own organization
CREATE POLICY "Users can delete own organization"
  ON organizations FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- JOB_POSTS POLICIES
-- =====================================================

-- Users can view their own job posts
CREATE POLICY "Users can view own job posts"
  ON job_posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own job posts
CREATE POLICY "Users can insert own job posts"
  ON job_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own job posts
CREATE POLICY "Users can update own job posts"
  ON job_posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own job posts
CREATE POLICY "Users can delete own job posts"
  ON job_posts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for organizations (updates both updated_at and last_updated)
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Uncomment below to add test data (replace user_id with actual UUID after signup)
/*
INSERT INTO user_profiles (user_id, gemini_api_key)
VALUES ('your-user-uuid-here', 'your-test-api-key');

INSERT INTO organizations (user_id, name, description, industry, location)
VALUES (
  'your-user-uuid-here',
  'Test Company Inc.',
  'A leading tech company',
  'Technology',
  'San Francisco, CA'
);
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ JobCraft AI Database Schema created successfully!';
  RAISE NOTICE '📋 Tables created: user_profiles, organizations, job_posts';
  RAISE NOTICE '🔒 Row Level Security enabled with policies';
  RAISE NOTICE '⚡ Triggers and functions configured';
END $$;
