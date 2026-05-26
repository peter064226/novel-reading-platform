-- Interactive Novel Platform — Database Schema
-- Run this in the Supabase SQL editor before running seed.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- novels table
-- ============================================================
CREATE TABLE IF NOT EXISTS novels (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT        NOT NULL,
  author      TEXT        NOT NULL,
  description TEXT        NOT NULL,
  cover_url   TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for homepage listing (newest first)
CREATE INDEX IF NOT EXISTS idx_novels_created_at ON novels (created_at DESC);

-- ============================================================
-- scenes table
-- ============================================================
CREATE TABLE IF NOT EXISTS scenes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  novel_id    UUID        NOT NULL REFERENCES novels (id) ON DELETE CASCADE,
  scene_order INTEGER     NOT NULL,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate scene positions within the same novel
  CONSTRAINT uq_scenes_novel_order UNIQUE (novel_id, scene_order)
);

-- Composite index for fast ordered scene retrieval
CREATE INDEX IF NOT EXISTS idx_scenes_novel_order ON scenes (novel_id, scene_order ASC);

-- ============================================================
-- Row Level Security (RLS) — public read, no anonymous writes
-- ============================================================
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read novels and scenes (public platform)
CREATE POLICY "Public read novels"
  ON novels FOR SELECT
  USING (true);

CREATE POLICY "Public read scenes"
  ON scenes FOR SELECT
  USING (true);
