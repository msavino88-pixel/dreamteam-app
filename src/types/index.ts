export type UserRole = 'admin' | 'manager' | 'consultant';
export type ClientStatus = 'active' | 'inactive' | 'lead' | 'churned';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type InteractionType = 'call' | 'email' | 'meeting' | 'note';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type IdeaStatus = 'new' | 'evaluating' | 'approved' | 'rejected' | 'implemented';
export type ProjectMemberRole = 'lead' | 'member';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
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
  created_at: string;
  updated_at: string;
  client?: Client;
  members?: ProjectMember[];
  tasks?: Task[];
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
