-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rate cards table (supports variable rates by role/skill)
CREATE TABLE rate_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual rate entries (allows flexible rate structures)
CREATE TABLE rate_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rate_card_id UUID REFERENCES rate_cards(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- e.g., "frontend", "backend", "devops"
  skill_level TEXT NOT NULL, -- e.g., "junior", "mid", "senior"
  hourly_rate_myr NUMERIC(10,2) NOT NULL,
  effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
  effective_to TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requirements categories with complexity weights
CREATE TABLE requirement_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- e.g., "Authentication", "Real-time Features"
  description TEXT,
  base_complexity_weight NUMERIC(5,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical projects for reference and learning
CREATE TABLE historical_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_name TEXT,
  estimated_hours NUMERIC(10,2),
  actual_hours NUMERIC(10,2),
  estimated_cost_myr NUMERIC(12,2),
  actual_cost_myr NUMERIC(12,2),
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Requirements extracted from user input
CREATE TABLE project_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES historical_projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES requirement_categories(id),
  description TEXT NOT NULL,
  is_functional BOOLEAN DEFAULT true,
  complexity_score NUMERIC(5,2), -- Calculated based on heuristics
  estimated_hours NUMERIC(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Final quotations
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES historical_projects(id) ON DELETE CASCADE,
  rate_card_id UUID REFERENCES rate_cards(id),
  total_estimated_hours NUMERIC(10,2),
  total_cost_myr NUMERIC(12,2),
  validity_days INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')) DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (created_at + INTERVAL '1 day' * validity_days) STORED
);

-- Insert default requirement categories
INSERT INTO requirement_categories (name, description, base_complexity_weight) VALUES
  ('Authentication', 'User authentication and authorization systems', 1.5),
  ('Database', 'Database design and implementation', 1.2),
  ('API Integration', 'Third-party API integrations', 1.8),
  ('Real-time Features', 'Real-time communication or updates', 2.0),
  ('File Handling', 'File upload, storage, and processing', 1.3),
  ('Payment Processing', 'Payment gateway integration', 2.5),
  ('Admin Dashboard', 'Administrative interface', 1.4),
  ('User Interface', 'Frontend UI components and interactions', 1.0),
  ('Mobile Responsiveness', 'Mobile-friendly design', 0.8),
  ('Reporting', 'Data reporting and analytics', 1.6);

-- Insert default rate card for Malaysian SME market
INSERT INTO rate_cards (name, description) VALUES
  ('Malaysian SME Standard', 'Standard rates for Malaysian SME software development');

-- Insert default rate entries
INSERT INTO rate_entries (rate_card_id, role, skill_level, hourly_rate_myr, effective_from) 
SELECT id, 'frontend', 'junior', 45.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'frontend', 'mid', 65.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'frontend', 'senior', 85.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'backend', 'junior', 50.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'backend', 'mid', 70.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'backend', 'senior', 90.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'fullstack', 'junior', 55.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'fullstack', 'mid', 75.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard'
UNION ALL
SELECT id, 'fullstack', 'senior', 95.00, NOW() FROM rate_cards WHERE name = 'Malaysian SME Standard';