import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SpendingChart } from '@/components/clients/SpendingChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClient, useUpdateClient } from '@/hooks/useClients';
import { useSpending } from '@/hooks/useSpending';
import { useInteractions } from '@/hooks/useInteractions';
import { useProjects } from '@/hooks/useProjects';
import { useUsers } from '@/hooks/useUsers';
import { calculateClientMetrics } from '@/lib/analytics';
import { formatCurrency, formatDate, formatRelativeDate, statusLabels, statusColors } from '@/lib/formatting';
import type { Client } from '@/types';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Globe, FileText,
  TrendingUp, AlertTriangle, Clock, MessageSquare, Euro, Pencil, Save, CheckCircle2
} from 'lucide-react';

const statusOptions = [
  { value: 'active', label: 'Attivo' },
  { value: 'inactive', label: 'Inattivo' },
  { value: 'lead', label: 'Lead' },
  { value: 'churned', label: 'Perso' },
];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: spending = [] } = useSpending(id);
  const { data: interactions = [] } = useInteractions(id);
  const { data: allProjects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const updateClient = useUpdateClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [editMsg, setEditMsg] = useState('');

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai clienti
        </Button>
        <p className="mt-4 text-muted-foreground">Cliente non trovato</p>
      </div>
    );
  }

  const openEdit = () => {
    setEditForm({
      company_name: client.company_name,
      contact_name: client.contact_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      industry: client.industry,
      vat_number: client.vat_number,
      website: client.website,
      notes: client.notes,
      status: client.status,
      assigned_to: client.assigned_to,
      source: client.source,
    });
    setEditMsg('');
    setEditOpen(true);
  };

  const handleSaveClient = async () => {
    try {
      await updateClient.mutateAsync({ id: client.id, ...editForm });
      setEditMsg('Salvato!');
      setTimeout(() => { setEditOpen(false); setEditMsg(''); }, 800);
    } catch (err: unknown) {
      setEditMsg(`Errore: ${err instanceof Error ? err.message : 'sconosciuto'}`);
    }
  };

  const projects = allProjects.filter(p => p.client_id === client.id);
  const activeProjectCount = projects.filter(p => p.status === 'active').length;
  const metrics = calculateClientMetrics(spending, interactions, activeProjectCount);
  const assignee = users.find(u => u.id === client.assigned_to);

  const churnColors = { low: 'text-green-600', medium: 'text-yellow-600', high: 'text-red-600' };
  const churnLabels = { low: 'Basso', medium: 'Medio', high: 'Alto' };

  return (
    <div>
      <Header title={client.company_name} />
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Tutti i clienti
        </Button>

        {/* Header Cliente */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{client.company_name}</h2>
                <Badge className={statusColors[client.status]}>{statusLabels[client.status]}</Badge>
              </div>
              <p className="text-muted-foreground">{client.contact_name} | {client.industry}</p>
              {assignee && <p className="text-sm text-muted-foreground">Gestito da: {assignee.full_name}</p>}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={openEdit} className="gap-2">
            <Pencil className="h-4 w-4" /> Modifica
          </Button>
        </div>

        {/* Metriche KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Euro className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Totale Speso</p>
              <p className="text-lg font-bold">{formatCurrency(metrics.total_spent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Media Spesa</p>
              <p className="text-lg font-bold">{formatCurrency(metrics.average_spending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Ultimo Acquisto</p>
              <p className="text-lg font-bold">{metrics.days_since_last_spending !== null ? `${metrics.days_since_last_spending}gg` : '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Interazioni</p>
              <p className="text-lg font-bold">{metrics.total_interactions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Progetti Attivi</p>
              <p className="text-lg font-bold">{metrics.active_projects}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className={`h-5 w-5 mx-auto mb-1 ${churnColors[metrics.churn_risk]}`} />
              <p className="text-xs text-muted-foreground">Rischio Churn</p>
              <p className={`text-lg font-bold ${churnColors[metrics.churn_risk]}`}>{churnLabels[metrics.churn_risk]}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Contatto */}
          <Card>
            <CardHeader><CardTitle className="text-base">Informazioni</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" /> {client.phone}
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {client.address}, {client.city}
                </div>
              )}
              {client.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" /> {client.website}
                </div>
              )}
              {client.vat_number && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" /> P.IVA: {client.vat_number}
                </div>
              )}
              {client.notes && (
                <div className="mt-3 p-3 rounded-lg bg-muted text-sm">
                  <p className="font-medium mb-1">Note</p>
                  <p className="text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grafico Spese */}
          <SpendingChart spending={spending} />
        </div>

        {/* Interazioni recenti */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ultime Interazioni</CardTitle></CardHeader>
          <CardContent>
            {interactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuna interazione registrata</p>
            ) : (
              <div className="space-y-3">
                {interactions.map(interaction => {
                  const user = users.find(u => u.id === interaction.user_id);
                  const typeIcons: Record<string, string> = { call: 'tel', email: 'email', meeting: 'meeting', note: 'note' };
                  const typeLabels: Record<string, string> = { call: 'Chiamata', email: 'Email', meeting: 'Meeting', note: 'Nota' };
                  return (
                    <div key={interaction.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Badge variant="outline">{typeLabels[interaction.type]}</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{interaction.subject}</p>
                        {interaction.description && <p className="text-xs text-muted-foreground mt-1">{interaction.description}</p>}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>{user?.full_name}</span>
                          <span>|</span>
                          <span>{formatRelativeDate(interaction.interaction_date)}</span>
                          {interaction.next_followup_date && (
                            <>
                              <span>|</span>
                              <span>Follow-up: {formatDate(interaction.next_followup_date)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spese */}
        <Card>
          <CardHeader><CardTitle className="text-base">Storico Pagamenti</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Descrizione</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Fattura</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Importo</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Stato</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Scadenza</th>
                  </tr>
                </thead>
                <tbody>
                  {spending.map(s => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2">{s.description}</td>
                      <td className="py-2 text-muted-foreground">{s.category}</td>
                      <td className="py-2 text-muted-foreground">{s.invoice_number}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(s.amount)}</td>
                      <td className="py-2"><Badge className={statusColors[s.payment_status]}>{statusLabels[s.payment_status]}</Badge></td>
                      <td className="py-2 text-muted-foreground">{formatDate(s.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Client Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent onClose={() => setEditOpen(false)} className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Azienda</label>
                <Input value={editForm.company_name || ''} onChange={e => setEditForm(f => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Referente</label>
                <Input value={editForm.contact_name || ''} onChange={e => setEditForm(f => ({ ...f, contact_name: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Telefono</label>
                <Input value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Indirizzo</label>
                <Input value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Città</label>
                <Input value={editForm.city || ''} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Settore</label>
                <Input value={editForm.industry || ''} onChange={e => setEditForm(f => ({ ...f, industry: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">P.IVA</label>
                <Input value={editForm.vat_number || ''} onChange={e => setEditForm(f => ({ ...f, vat_number: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Sito Web</label>
                <Input value={editForm.website || ''} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Fonte</label>
                <Input value={editForm.source || ''} onChange={e => setEditForm(f => ({ ...f, source: e.target.value }))} placeholder="Referral, LinkedIn, Evento..." />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stato</label>
                <Select options={statusOptions} value={editForm.status || 'active'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Client['status'] }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Assegnato a</label>
                <Select
                  options={[{ value: '', label: 'Nessuno' }, ...users.map(u => ({ value: u.id, label: u.full_name }))]}
                  value={editForm.assigned_to || ''}
                  onChange={e => setEditForm(f => ({ ...f, assigned_to: e.target.value || null }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Note</label>
              <textarea
                className="w-full min-h-[80px] rounded-2xl bg-card border border-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                value={editForm.notes || ''}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Note sul cliente..."
              />
            </div>

            {editMsg && (
              <div className={`p-2.5 rounded-xl text-sm ${editMsg.startsWith('Errore') ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>
                {!editMsg.startsWith('Errore') && <CheckCircle2 className="inline h-4 w-4 mr-1" />}
                {editMsg}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveClient} disabled={updateClient.isPending || !editForm.company_name?.trim()} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {updateClient.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Annulla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
