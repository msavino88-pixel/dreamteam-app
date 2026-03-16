import type { User, Client, ClientSpending, ClientInteraction, Project, Task, Idea, ActivityFeedItem } from '@/types';

export const mockUsers: User[] = [
  { id: '1', email: 'marco@consultub.it', full_name: 'Marco Rossi', role: 'admin', avatar_url: null, phone: '+39 333 1234567', is_active: true, created_at: '2024-01-01T00:00:00Z' },
  { id: '2', email: 'giulia@consultub.it', full_name: 'Giulia Bianchi', role: 'manager', avatar_url: null, phone: '+39 333 2345678', is_active: true, created_at: '2024-01-15T00:00:00Z' },
  { id: '3', email: 'luca@consultub.it', full_name: 'Luca Verdi', role: 'consultant', avatar_url: null, phone: '+39 333 3456789', is_active: true, created_at: '2024-02-01T00:00:00Z' },
  { id: '4', email: 'sara@consultub.it', full_name: 'Sara Neri', role: 'consultant', avatar_url: null, phone: '+39 333 4567890', is_active: true, created_at: '2024-03-01T00:00:00Z' },
];

export const mockClients: Client[] = [
  { id: 'c1', company_name: 'TechStar Srl', contact_name: 'Andrea Fontana', email: 'andrea@techstar.it', phone: '+39 02 1234567', address: 'Via Roma 15', city: 'Milano', industry: 'Tecnologia', vat_number: 'IT12345678901', website: 'techstar.it', notes: 'Cliente premium, preferisce comunicazioni via email', status: 'active', acquisition_date: '2024-01-15', source: 'Referral', assigned_to: '1', created_by: '1', created_at: '2024-01-15T10:00:00Z', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'c2', company_name: 'Green Energy SpA', contact_name: 'Laura Martini', email: 'laura@greenenergy.it', phone: '+39 06 2345678', address: 'Viale Europa 42', city: 'Roma', industry: 'Energia', vat_number: 'IT23456789012', website: 'greenenergy.it', notes: 'Interessati a consulenza ESG', status: 'active', acquisition_date: '2024-03-01', source: 'Evento', assigned_to: '2', created_by: '1', created_at: '2024-03-01T10:00:00Z', updated_at: '2024-11-15T10:00:00Z' },
  { id: 'c3', company_name: 'FoodItalia Group', contact_name: 'Paolo Colombo', email: 'paolo@fooditalia.it', phone: '+39 055 3456789', address: 'Via Dante 8', city: 'Firenze', industry: 'Food & Beverage', vat_number: 'IT34567890123', website: 'fooditalia.it', notes: null, status: 'lead', acquisition_date: null, source: 'LinkedIn', assigned_to: '3', created_by: '2', created_at: '2024-06-15T10:00:00Z', updated_at: '2024-10-01T10:00:00Z' },
  { id: 'c4', company_name: 'Moda Luxe Srl', contact_name: 'Francesca Villa', email: 'francesca@modaluxe.it', phone: '+39 02 4567890', address: 'Corso Venezia 22', city: 'Milano', industry: 'Moda', vat_number: 'IT45678901234', website: 'modaluxe.it', notes: 'Budget alto, vuole risultati rapidi', status: 'active', acquisition_date: '2024-02-10', source: 'Sito web', assigned_to: '4', created_by: '1', created_at: '2024-02-10T10:00:00Z', updated_at: '2024-12-10T10:00:00Z' },
  { id: 'c5', company_name: 'AutoParts International', contact_name: 'Roberto Galli', email: 'roberto@autoparts.it', phone: '+39 011 5678901', address: 'Via Torino 55', city: 'Torino', industry: 'Automotive', vat_number: 'IT56789012345', website: 'autoparts.it', notes: 'Non risponde da 4 mesi', status: 'churned', acquisition_date: '2023-06-01', source: 'Cold call', assigned_to: '2', created_by: '2', created_at: '2023-06-01T10:00:00Z', updated_at: '2024-08-01T10:00:00Z' },
];

export const mockSpending: ClientSpending[] = [
  { id: 's1', client_id: 'c1', amount: 15000, currency: 'EUR', description: 'Consulenza strategica Q1', category: 'Consulenza', invoice_number: 'INV-2024-001', payment_status: 'paid', payment_date: '2024-03-15', due_date: '2024-03-30', created_at: '2024-03-01T10:00:00Z' },
  { id: 's2', client_id: 'c1', amount: 22000, currency: 'EUR', description: 'Progetto digitalizzazione', category: 'Progetto', invoice_number: 'INV-2024-015', payment_status: 'paid', payment_date: '2024-06-20', due_date: '2024-06-30', created_at: '2024-06-01T10:00:00Z' },
  { id: 's3', client_id: 'c1', amount: 8500, currency: 'EUR', description: 'Consulenza Q4', category: 'Consulenza', invoice_number: 'INV-2024-042', payment_status: 'pending', payment_date: null, due_date: '2025-01-15', created_at: '2024-12-01T10:00:00Z' },
  { id: 's4', client_id: 'c2', amount: 35000, currency: 'EUR', description: 'Audit energetico completo', category: 'Audit', invoice_number: 'INV-2024-008', payment_status: 'paid', payment_date: '2024-05-10', due_date: '2024-05-30', created_at: '2024-04-15T10:00:00Z' },
  { id: 's5', client_id: 'c2', amount: 12000, currency: 'EUR', description: 'Report ESG annuale', category: 'Report', invoice_number: 'INV-2024-035', payment_status: 'paid', payment_date: '2024-10-05', due_date: '2024-10-15', created_at: '2024-09-20T10:00:00Z' },
  { id: 's6', client_id: 'c4', amount: 45000, currency: 'EUR', description: 'Rebranding completo', category: 'Branding', invoice_number: 'INV-2024-020', payment_status: 'paid', payment_date: '2024-07-01', due_date: '2024-07-15', created_at: '2024-06-15T10:00:00Z' },
  { id: 's7', client_id: 'c4', amount: 18000, currency: 'EUR', description: 'Campagna social media', category: 'Marketing', invoice_number: 'INV-2024-045', payment_status: 'overdue', payment_date: null, due_date: '2024-12-01', created_at: '2024-11-15T10:00:00Z' },
];

export const mockInteractions: ClientInteraction[] = [
  { id: 'i1', client_id: 'c1', user_id: '1', type: 'meeting', subject: 'Revisione Q4', description: 'Discusso obiettivi Q1 2025', interaction_date: '2024-12-10T14:00:00Z', next_followup_date: '2025-01-15', created_at: '2024-12-10T14:00:00Z' },
  { id: 'i2', client_id: 'c1', user_id: '1', type: 'email', subject: 'Proposta nuovo progetto', description: 'Inviata proposta per progetto AI', interaction_date: '2024-12-15T09:00:00Z', next_followup_date: '2024-12-22', created_at: '2024-12-15T09:00:00Z' },
  { id: 'i3', client_id: 'c2', user_id: '2', type: 'call', subject: 'Follow-up report ESG', description: 'Cliente soddisfatto, vuole estendere collaborazione', interaction_date: '2024-11-20T11:00:00Z', next_followup_date: '2025-01-10', created_at: '2024-11-20T11:00:00Z' },
  { id: 'i4', client_id: 'c4', user_id: '4', type: 'meeting', subject: 'Kick-off campagna SS25', description: 'Definiti KPI e timeline', interaction_date: '2024-12-05T10:00:00Z', next_followup_date: '2024-12-20', created_at: '2024-12-05T10:00:00Z' },
  { id: 'i5', client_id: 'c3', user_id: '3', type: 'email', subject: 'Primo contatto', description: 'Inviata presentazione aziendale', interaction_date: '2024-09-15T16:00:00Z', next_followup_date: '2024-10-01', created_at: '2024-09-15T16:00:00Z' },
];

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Digitalizzazione Processi', description: 'Implementazione sistema ERP e automazione workflow', client_id: 'c1', status: 'active', priority: 'high', start_date: '2024-09-01', end_date: '2025-03-31', budget: 55000, created_by: '1', created_at: '2024-08-15T10:00:00Z', updated_at: '2024-12-15T10:00:00Z' },
  { id: 'p2', name: 'Audit ESG 2025', description: 'Valutazione impatto ambientale e report di sostenibilità', client_id: 'c2', status: 'planning', priority: 'medium', start_date: '2025-01-15', end_date: '2025-06-30', budget: 40000, created_by: '2', created_at: '2024-11-01T10:00:00Z', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'p3', name: 'Rebranding SS25', description: 'Nuova identità visiva per collezione primavera/estate', client_id: 'c4', status: 'active', priority: 'urgent', start_date: '2024-10-01', end_date: '2025-02-28', budget: 63000, created_by: '4', created_at: '2024-09-20T10:00:00Z', updated_at: '2024-12-10T10:00:00Z' },
  { id: 'p4', name: 'Piano Marketing Digitale', description: 'Strategia SEO/SEM e social media per il 2025', client_id: 'c1', status: 'completed', priority: 'medium', start_date: '2024-04-01', end_date: '2024-08-31', budget: 22000, created_by: '1', created_at: '2024-03-15T10:00:00Z', updated_at: '2024-08-31T10:00:00Z' },
];

export const mockTasks: Task[] = [
  { id: 't1', project_id: 'p1', title: 'Analisi requisiti', description: 'Mappatura processi attuali e identificazione gap', status: 'done', assigned_to: '1', priority: 'high', position: 0, due_date: '2024-09-30', completed_at: '2024-09-28T10:00:00Z', created_at: '2024-09-01T10:00:00Z', updated_at: '2024-09-28T10:00:00Z' },
  { id: 't2', project_id: 'p1', title: 'Selezione piattaforma ERP', description: 'Valutazione e comparazione soluzioni disponibili', status: 'done', assigned_to: '3', priority: 'high', position: 1, due_date: '2024-10-31', completed_at: '2024-10-25T10:00:00Z', created_at: '2024-09-01T10:00:00Z', updated_at: '2024-10-25T10:00:00Z' },
  { id: 't3', project_id: 'p1', title: 'Configurazione ambiente', description: 'Setup infrastruttura e ambienti di sviluppo', status: 'in_progress', assigned_to: '3', priority: 'medium', position: 2, due_date: '2024-12-31', completed_at: null, created_at: '2024-10-01T10:00:00Z', updated_at: '2024-12-15T10:00:00Z' },
  { id: 't4', project_id: 'p1', title: 'Migrazione dati', description: 'Trasferimento dati dal sistema legacy', status: 'todo', assigned_to: '1', priority: 'high', position: 3, due_date: '2025-01-31', completed_at: null, created_at: '2024-10-01T10:00:00Z', updated_at: '2024-10-01T10:00:00Z' },
  { id: 't5', project_id: 'p1', title: 'Test e validazione', description: 'UAT e fix bug critici', status: 'todo', assigned_to: null, priority: 'high', position: 4, due_date: '2025-02-28', completed_at: null, created_at: '2024-10-01T10:00:00Z', updated_at: '2024-10-01T10:00:00Z' },
  { id: 't6', project_id: 'p1', title: 'Go-live e formazione', description: 'Deploy in produzione e training utenti', status: 'todo', assigned_to: null, priority: 'urgent', position: 5, due_date: '2025-03-31', completed_at: null, created_at: '2024-10-01T10:00:00Z', updated_at: '2024-10-01T10:00:00Z' },
  { id: 't7', project_id: 'p3', title: 'Moodboard e concept', description: 'Definizione direzione creativa', status: 'done', assigned_to: '4', priority: 'high', position: 0, due_date: '2024-10-15', completed_at: '2024-10-14T10:00:00Z', created_at: '2024-10-01T10:00:00Z', updated_at: '2024-10-14T10:00:00Z' },
  { id: 't8', project_id: 'p3', title: 'Design logo e palette', description: 'Nuove proposte grafiche', status: 'in_progress', assigned_to: '4', priority: 'urgent', position: 1, due_date: '2024-12-20', completed_at: null, created_at: '2024-10-15T10:00:00Z', updated_at: '2024-12-10T10:00:00Z' },
  { id: 't9', project_id: 'p3', title: 'Materiale marketing', description: 'Catalogo, social kit, packaging', status: 'todo', assigned_to: '4', priority: 'high', position: 2, due_date: '2025-01-31', completed_at: null, created_at: '2024-10-15T10:00:00Z', updated_at: '2024-10-15T10:00:00Z' },
];

export const mockIdeas: Idea[] = [
  { id: 'id1', title: 'Dashboard cliente con AI predittiva', description: 'Usare ML per prevedere churn e suggerire azioni proattive sui clienti a rischio', author_id: '1', client_id: null, project_id: null, status: 'evaluating', tags: ['AI', 'CRM', 'innovazione'], votes: 5, created_at: '2024-11-15T10:00:00Z', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'id2', title: 'Template report ESG automatizzato', description: 'Creare template standardizzati per velocizzare la produzione dei report ESG', author_id: '2', client_id: 'c2', project_id: 'p2', status: 'approved', tags: ['ESG', 'automazione'], votes: 3, created_at: '2024-11-20T10:00:00Z', updated_at: '2024-12-05T10:00:00Z' },
  { id: 'id3', title: 'Workshop mensile team', description: 'Organizzare sessioni di knowledge sharing tra consulenti', author_id: '3', client_id: null, project_id: null, status: 'new', tags: ['team', 'formazione'], votes: 7, created_at: '2024-12-01T10:00:00Z', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'id4', title: 'Integrazione CRM con LinkedIn', description: 'Importare automaticamente i contatti e le interazioni da LinkedIn Sales Navigator', author_id: '1', client_id: null, project_id: null, status: 'new', tags: ['CRM', 'integrazione', 'LinkedIn'], votes: 4, created_at: '2024-12-10T10:00:00Z', updated_at: '2024-12-10T10:00:00Z' },
];

export const mockActivities: ActivityFeedItem[] = [
  { id: 'a1', user_id: '1', action_type: 'created', entity_type: 'interaction', entity_id: 'i2', description: 'Marco ha inviato una proposta a TechStar Srl', metadata: {}, created_at: '2024-12-15T09:00:00Z' },
  { id: 'a2', user_id: '4', action_type: 'updated', entity_type: 'task', entity_id: 't8', description: 'Sara sta lavorando sul design del logo per Moda Luxe', metadata: {}, created_at: '2024-12-14T16:30:00Z' },
  { id: 'a3', user_id: '3', action_type: 'created', entity_type: 'idea', entity_id: 'id3', description: 'Luca ha proposto: Workshop mensile team', metadata: {}, created_at: '2024-12-01T10:00:00Z' },
  { id: 'a4', user_id: '2', action_type: 'updated', entity_type: 'project', entity_id: 'p2', description: 'Giulia ha aggiornato il progetto Audit ESG 2025', metadata: {}, created_at: '2024-12-01T09:00:00Z' },
  { id: 'a5', user_id: '1', action_type: 'created', entity_type: 'client', entity_id: 'c4', description: 'Marco ha aggiunto un nuovo cliente: Moda Luxe Srl', metadata: {}, created_at: '2024-02-10T10:00:00Z' },
];
