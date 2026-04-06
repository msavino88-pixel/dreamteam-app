-- ══════════════════════════════════════════════════════════
-- 005: Messages, Prospects (Obiettivi), Contract uploads, Project updates log
-- ══════════════════════════════════════════════════════════

-- ── Messages (user-to-user) ──
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_user_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own messages" ON messages FOR SELECT TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated
  WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "Users can mark own messages read" ON messages FOR UPDATE TO authenticated
  USING (to_user_id = auth.uid());
CREATE POLICY "Users can delete own sent messages" ON messages FOR DELETE TO authenticated
  USING (from_user_id = auth.uid());

-- ── Prospects / Obiettivi ──
CREATE TABLE IF NOT EXISTS prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','negotiating','converted','lost')),
  assigned_to UUID REFERENCES users(id),
  suggested_template_id UUID REFERENCES project_templates(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_prospects_updated_at BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read prospects" ON prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert prospects" ON prospects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update prospects" ON prospects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete prospects" ON prospects FOR DELETE TO authenticated USING (true);

-- ── Project Updates / Activity Log ──
CREATE TABLE IF NOT EXISTS project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project ON project_updates(project_id, created_at DESC);

ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read project updates" ON project_updates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert project updates" ON project_updates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete own updates" ON project_updates FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── Contract URL on projects ──
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_url TEXT;

-- ── Time tracking on tasks ──
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS logged_hours NUMERIC DEFAULT 0;

-- ── Enable realtime on new tables ──
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE prospects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_updates;
