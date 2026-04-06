import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProspects, useCreateProspect, useUpdateProspect, useDeleteProspect } from '@/hooks/useProspects';
import { useUsers } from '@/hooks/useUsers';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { prospectStatusLabels, prospectStatusColors, formatRelativeDate } from '@/lib/formatting';
import type { Prospect, ProspectStatus } from '@/types';
import {
  Target, Building2, Mail, Phone, User, Pencil, Trash2,
  ArrowRight, FolderKanban, MoreVertical, Save
} from 'lucide-react';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu';

const statusOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'new', label: 'Nuovo' },
  { value: 'contacted', label: 'Contattato' },
  { value: 'negotiating', label: 'In Trattativa' },
  { value: 'converted', label: 'Convertito' },
  { value: 'lost', label: 'Perso' },
];

const statusEditOptions = statusOptions.filter(s => s.value !== '');

export default function Prospects() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: prospects = [] } = useProspects();
  const { data: users = [] } = useUsers();
  const { data: templates = [] } = useProjectTemplates();
  const createProspect = useCreateProspect();
  const updateProspect = useUpdateProspect();
  const deleteProspect = useDeleteProspect();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ProspectStatus>('new');
  const [assignedTo, setAssignedTo] = useState('');
  const [templateId, setTemplateId] = useState('');

  const resetForm = () => {
    setCompanyName(''); setContactName(''); setEmail(''); setPhone('');
    setNotes(''); setStatus('new'); setAssignedTo(''); setTemplateId('');
  };

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (p: Prospect) => {
    setEditing(p);
    setCompanyName(p.company_name);
    setContactName(p.contact_name || '');
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setNotes(p.notes || '');
    setStatus(p.status);
    setAssignedTo(p.assigned_to || '');
    setTemplateId(p.suggested_template_id || '');
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      company_name: companyName.trim(),
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
      status,
      assigned_to: assignedTo || null,
      suggested_template_id: templateId || null,
    };
    if (editing) {
      updateProspect.mutate({ id: editing.id, ...data }, { onSuccess: () => setFormOpen(false) });
    } else {
      createProspect.mutate({ ...data, created_by: profile?.id }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleConvertToClient = (p: Prospect) => {
    navigate(`/clients/new?company=${encodeURIComponent(p.company_name)}&contact=${encodeURIComponent(p.contact_name || '')}&email=${encodeURIComponent(p.email || '')}&phone=${encodeURIComponent(p.phone || '')}`);
    updateProspect.mutate({ id: p.id, status: 'converted' });
  };

  const filtered = prospects.filter(p => !statusFilter || p.status === statusFilter);

  const userOptions = [{ value: '', label: 'Non assegnato' }, ...users.map(u => ({ value: u.id, label: u.full_name }))];
  const templateOptions = [{ value: '', label: 'Nessun modello' }, ...templates.map(t => ({ value: t.id, label: t.name }))];

  return (
    <div>
      <Header
        title="Obiettivi"
        onQuickAdd={openCreate}
        quickAddLabel="Nuovo Prospect"
      />
      <div className="p-4 md:p-6 space-y-4">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-48"
        />

        <p className="text-sm text-muted-foreground">
          {filtered.length} prospect{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const assignee = users.find(u => u.id === p.assigned_to);
            const template = templates.find(t => t.id === p.suggested_template_id);
            return (
              <div key={p.id} className="rounded-[28px] bg-card shadow-soft p-5 md:p-6 hover:shadow-float transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-muted p-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${prospectStatusColors[p.status]}`}>
                      {prospectStatusLabels[p.status]}
                    </span>
                  </div>
                  <DropdownMenu trigger={<button className="p-1 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="h-3.5 w-3.5 text-muted-foreground" /></button>}>
                    <DropdownItem onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /> Modifica</DropdownItem>
                    {p.status !== 'converted' && (
                      <DropdownItem onClick={() => handleConvertToClient(p)}><ArrowRight className="h-3.5 w-3.5" /> Converti in Cliente</DropdownItem>
                    )}
                    {statusEditOptions.filter(s => s.value !== p.status).map(s => (
                      <DropdownItem key={s.value} onClick={() => updateProspect.mutate({ id: p.id, status: s.value as ProspectStatus })}>
                        Segna: {s.label}
                      </DropdownItem>
                    ))}
                    <DropdownItem variant="danger" onClick={() => {
                      if (window.confirm(`Eliminare "${p.company_name}"?`)) deleteProspect.mutate(p.id);
                    }}>
                      <Trash2 className="h-3.5 w-3.5" /> Elimina
                    </DropdownItem>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-sm mb-1">{p.company_name}</h3>
                {p.contact_name && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <User className="h-3 w-3" /> {p.contact_name}
                  </div>
                )}
                {p.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Mail className="h-3 w-3" /> {p.email}
                  </div>
                )}
                {p.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Phone className="h-3 w-3" /> {p.phone}
                  </div>
                )}
                {p.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.notes}</p>}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {assignee && (
                      <span className="flex items-center gap-1">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#9B8EBD] to-[#7B9BBF] flex items-center justify-center text-[7px] font-bold text-white">
                          {assignee.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {assignee.full_name}
                      </span>
                    )}
                    {template && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted">
                        <FolderKanban className="h-2.5 w-2.5" /> {template.name}
                      </span>
                    )}
                  </div>
                  <span>{formatRelativeDate(p.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nessun prospect trovato. Aggiungi il primo!
          </div>
        )}
      </div>

      {formOpen && (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent onClose={() => setFormOpen(false)} className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifica Prospect' : 'Nuovo Prospect'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Azienda *</label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome azienda" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Referente</label>
                <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Nome e cognome" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@azienda.it" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Telefono</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Stato</label>
                  <Select options={statusEditOptions} value={status} onChange={e => setStatus(e.target.value as ProspectStatus)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Assegnato a</label>
                  <Select options={userOptions} value={assignedTo} onChange={e => setAssignedTo(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Progetto Suggerito</label>
                <Select options={templateOptions} value={templateId} onChange={e => setTemplateId(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Note</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Note sul prospect..." />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={!companyName.trim()} className="flex-1 gap-2">
                  <Save className="h-4 w-4" /> {editing ? 'Salva' : 'Crea Prospect'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Annulla</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
