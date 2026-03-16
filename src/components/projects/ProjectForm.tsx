import { useState } from 'react';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClients } from '@/hooks/useClients';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Partial<Project>) => void;
}

const statusOptions = [
  { value: 'planning', label: 'Pianificazione' },
  { value: 'active', label: 'Attivo' },
  { value: 'paused', label: 'In pausa' },
  { value: 'completed', label: 'Completato' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export function ProjectForm({ open, onOpenChange, onSave }: ProjectFormProps) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    client_id: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: '',
  });

  const { data: clients = [] } = useClients();
  const clientOptions = clients.map(c => ({ value: c.id, label: c.company_name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      budget: form.budget ? parseFloat(form.budget) : undefined,
    } as Partial<Project>);
    onOpenChange(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuovo Progetto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome Progetto *</label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Cliente *</label>
            <Select options={clientOptions} placeholder="Seleziona cliente..." value={form.client_id} onChange={e => update('client_id', e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Descrizione</label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Stato</label>
              <Select options={statusOptions} value={form.status} onChange={e => update('status', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Priorità</label>
              <Select options={priorityOptions} value={form.priority} onChange={e => update('priority', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data Inizio</label>
              <Input type="date" value={form.start_date} onChange={e => update('start_date', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data Fine</label>
              <Input type="date" value={form.end_date} onChange={e => update('end_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Budget</label>
            <Input type="number" step="0.01" value={form.budget} onChange={e => update('budget', e.target.value)} placeholder="0.00" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit">Crea Progetto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
