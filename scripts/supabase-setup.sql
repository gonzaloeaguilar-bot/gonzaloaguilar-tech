-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Creates the subscribers table for gonzalo.tech newsletter

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'gonzalo.tech',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);

-- RLS: anon can INSERT only (for the newsletter form), nothing else
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Only authenticated/service_role can read subscribers
CREATE POLICY "Service role can read" ON subscribers
  FOR SELECT TO authenticated
  USING (true);
