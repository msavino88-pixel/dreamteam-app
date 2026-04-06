export type UserRole = 'admin' | 'manager' | 'consultant';
export type ClientStatus = 'active' | 'inactive' | 'lead' | 'churned';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type IdeaStatus = 'new' | 'evaluating' | 'approved' | 'rejected' | 'implemented';
export type ProjectMemberRole = 'lead' | 'member';
export type Department = 'management' | 'marketing' | 'finance' | 'branding' | 'hr' | 'ai';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: Department | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  industry: string | null;
  vat_number: string | null;
  website: string | null;
  notes: string | null;
  status: ClientStatus;
  acquisition_date: string | null;
  source: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientSpending {
  id: string;
  client_id: string;
  amount: number;
  currency: string;
  description: string | null;
  category: string | null;
  invoice_number: string | null;
  payment_status: PaymentStatus;
  payment_date: string | null;
  due_date: string | null;
  created_at: string;
}

export interface ClientInteraction {
  id: string;
  client_id: string;
  user_id: string;
  type: InteractionType;
  subject: string;
  description: string | null;
  interaction_date: string;
  next_followup_date: string | null;
  created_at: string;
}

export interface ClientPreference {
  id: string;
  client_id: string;
  category: string;
  preference_key: string;
  preference_value: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  status: ProjectStatus;
  priority: Priority;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_by: string | null;
  contract_url: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  members?: ProjectMember[];
  tasks?: Task[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  priority: Priority;
  budget: number | null;
  default_tasks: { title: string; priority: string }[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: string;
  user?: User;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  priority: Priority;
  position: number;
  due_date: string | null;
  estimated_hours: number | null;
  logged_hours: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: User;
}

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  author_id: string;
  client_id: string | null;
  project_id: string | null;
  status: IdeaStatus;
  tags: string[];
  votes: number;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export type CommentEntityType = 'task' | 'project' | 'idea';

export interface Comment {
  id: string;
  entity_type: CommentEntityType;
  entity_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export type ProspectStatus = 'new' | 'contacted' | 'negotiating' | 'converted' | 'lost';

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
}

export interface Prospect {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: ProspectStatus;
  assigned_to: string | null;
  suggested_template_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

// Metriche calcolate CRM
export interface ClientMetrics {
  total_spent: number;
  average_spending: number;
  last_spending_date: string | null;
  days_since_last_spending: number | null;
  total_interactions: number;
  last_interaction_date: string | null;
  days_since_last_interaction: number | null;
  active_projects: number;
  lifetime_value: number;
  churn_risk: 'low' | 'medium' | 'high';
}
