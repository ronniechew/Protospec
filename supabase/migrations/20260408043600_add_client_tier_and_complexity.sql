-- Migration to add client_tier, project_complexity_multiplier, and seasonal adjustments

-- Add client_tier column to rate_cards
ALTER TABLE rate_cards 
ADD COLUMN IF NOT EXISTS client_tier TEXT CHECK (client_tier IN ('startup', 'growing', 'enterprise')) DEFAULT 'startup';

-- Add seasonal adjustment columns to rate_entries
ALTER TABLE rate_entries 
ADD COLUMN IF NOT EXISTS seasonal_adjustment_factor NUMERIC(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS season TEXT CHECK (season IN ('q1', 'q2', 'q3', 'q4', 'none')) DEFAULT 'none';

-- Add client_tier and project_complexity_multiplier to historical_projects
ALTER TABLE historical_projects 
ADD COLUMN IF NOT EXISTS client_tier TEXT CHECK (client_tier IN ('startup', 'growing', 'enterprise')) DEFAULT 'startup',
ADD COLUMN IF NOT EXISTS project_complexity_multiplier NUMERIC(4,2) DEFAULT 1.0;

-- Update existing rate cards to have client_tier
UPDATE rate_cards 
SET client_tier = 'startup' 
WHERE client_tier IS NULL;

-- Update existing historical projects to have client_tier
UPDATE historical_projects 
SET client_tier = 'startup' 
WHERE client_tier IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rate_cards_client_tier ON rate_cards(client_tier);
CREATE INDEX IF NOT EXISTS idx_rate_entries_season ON rate_entries(season);
CREATE INDEX IF NOT EXISTS idx_historical_projects_client_tier ON historical_projects(client_tier);
CREATE INDEX IF NOT EXISTS idx_historical_projects_complexity ON historical_projects(project_complexity_multiplier);