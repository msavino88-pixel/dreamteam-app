-- Add department/area to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT
  CHECK (department IN ('management', 'marketing', 'finance', 'branding', 'hr', 'ai'))
  DEFAULT NULL;
