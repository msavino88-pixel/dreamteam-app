-- Project templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  budget NUMERIC(12,2),
  default_tasks JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read templates" ON project_templates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert templates" ON project_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update templates" ON project_templates FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete templates" ON project_templates FOR DELETE USING (true);
