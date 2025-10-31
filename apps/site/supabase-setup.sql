-- Create the email_subscribers table for ETS landing page
-- Run this in your Supabase SQL editor (SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  source VARCHAR(50) DEFAULT 'landing_page'
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);

-- Enable Row Level Security (recommended)
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow inserts from anonymous users (for the public API)
CREATE POLICY "Anyone can insert email" ON email_subscribers
  FOR INSERT WITH CHECK (true);

-- Create a policy to only allow authenticated users to view emails (admin only)
CREATE POLICY "Only authenticated can view emails" ON email_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Optional: Create a view for easy CSV export
CREATE OR REPLACE VIEW email_export AS
SELECT
  email,
  created_at,
  source
FROM email_subscribers
ORDER BY created_at DESC;