-- ============================================
-- ConsultHub — Schema Database Completo
-- ============================================

-- 1. USERS (Team / Consulenti)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null default 'consultant' check (role in ('admin', 'manager', 'consultant')),
  avatar_url text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2. CLIENTS (CRM Core)
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text,
  phone text,
  address text,
  city text,
  industry text,
  vat_number text,
  website text,
  notes text,
  status text not null default 'lead' check (status in ('active', 'inactive', 'lead', 'churned')),
  acquisition_date date,
  source text,
  assigned_to uuid references public.users(id),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. CLIENT SPENDING (Storico Spese)
create table public.client_spending (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  description text,
  category text,
  invoice_number text,
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending', 'overdue')),
  payment_date date,
  due_date date,
  created_at timestamptz not null default now()
);

-- 4. CLIENT INTERACTIONS (Log Contatti)
create table public.client_interactions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.users(id),
  type text not null check (type in ('call', 'email', 'meeting', 'note')),
  subject text not null,
  description text,
  interaction_date timestamptz not null default now(),
  next_followup_date date,
  created_at timestamptz not null default now()
);

-- 5. CLIENT PREFERENCES (Preferenze & Tag)
create table public.client_preferences (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  category text not null,
  preference_key text not null,
  preference_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. PROJECTS (Progetti)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  client_id uuid not null references public.clients(id) on delete cascade,
  status text not null default 'planning' check (status in ('planning', 'active', 'paused', 'completed', 'archived')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  start_date date,
  end_date date,
  budget numeric(12,2),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. PROJECT MEMBERS (Assegnazione Consulenti)
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('lead', 'member')),
  joined_at timestamptz not null default now(),
  unique(project_id, user_id)
);

-- 8. TASKS (Step di Completamento)
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  assigned_to uuid references public.users(id),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  position integer not null default 0,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. IDEAS (Idee Random)
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  author_id uuid not null references public.users(id),
  client_id uuid references public.clients(id),
  project_id uuid references public.projects(id),
  status text not null default 'new' check (status in ('new', 'evaluating', 'approved', 'rejected', 'implemented')),
  tags text[] default '{}',
  votes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. ACTIVITY FEED (Feed Real-time)
create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  action_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  description text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- INDEXES
create index idx_clients_status on public.clients(status);
create index idx_clients_assigned on public.clients(assigned_to);
create index idx_spending_client on public.client_spending(client_id);
create index idx_spending_date on public.client_spending(payment_date);
create index idx_interactions_client on public.client_interactions(client_id);
create index idx_projects_client on public.projects(client_id);
create index idx_projects_status on public.projects(status);
create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_assigned on public.tasks(assigned_to);
create index idx_ideas_author on public.ideas(author_id);
create index idx_activity_created on public.activity_feed(created_at desc);

-- UPDATED_AT TRIGGER
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_clients_updated before update on public.clients
  for each row execute function public.update_updated_at();
create trigger tr_projects_updated before update on public.projects
  for each row execute function public.update_updated_at();
create trigger tr_tasks_updated before update on public.tasks
  for each row execute function public.update_updated_at();
create trigger tr_ideas_updated before update on public.ideas
  for each row execute function public.update_updated_at();
create trigger tr_preferences_updated before update on public.client_preferences
  for each row execute function public.update_updated_at();

-- ENABLE REALTIME
alter publication supabase_realtime add table public.clients;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.ideas;
alter publication supabase_realtime add table public.activity_feed;
alter publication supabase_realtime add table public.client_spending;

-- ROW LEVEL SECURITY
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.client_spending enable row level security;
alter table public.client_interactions enable row level security;
alter table public.client_preferences enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.ideas enable row level security;
alter table public.activity_feed enable row level security;

-- Policy: tutti gli utenti autenticati possono leggere tutto (per semplicità iniziale)
-- In produzione, restringere per ruolo
create policy "Authenticated users can read all" on public.users for select using (true);
create policy "Authenticated users can read clients" on public.clients for select using (true);
create policy "Authenticated users can insert clients" on public.clients for insert with check (true);
create policy "Authenticated users can update clients" on public.clients for update using (true);
create policy "Authenticated users can read spending" on public.client_spending for select using (true);
create policy "Authenticated users can insert spending" on public.client_spending for insert with check (true);
create policy "Authenticated users can read interactions" on public.client_interactions for select using (true);
create policy "Authenticated users can insert interactions" on public.client_interactions for insert with check (true);
create policy "Authenticated users can read preferences" on public.client_preferences for select using (true);
create policy "Authenticated users can manage preferences" on public.client_preferences for all using (true);
create policy "Authenticated users can read projects" on public.projects for select using (true);
create policy "Authenticated users can insert projects" on public.projects for insert with check (true);
create policy "Authenticated users can update projects" on public.projects for update using (true);
create policy "Authenticated users can read members" on public.project_members for select using (true);
create policy "Authenticated users can manage members" on public.project_members for all using (true);
create policy "Authenticated users can read tasks" on public.tasks for select using (true);
create policy "Authenticated users can manage tasks" on public.tasks for all using (true);
create policy "Authenticated users can read ideas" on public.ideas for select using (true);
create policy "Authenticated users can manage ideas" on public.ideas for all using (true);
create policy "Authenticated users can read activity" on public.activity_feed for select using (true);
create policy "Authenticated users can insert activity" on public.activity_feed for insert with check (true);
