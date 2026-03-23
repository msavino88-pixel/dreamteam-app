import { useState, useEffect } from 'react';
import type { Project, ProjectTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClients } from '@/hooks/useClients';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { FileStack } from 'lucide-react';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Partial<Project>, taskTitles?: { title: string; priority: string }[]) => void;
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

const emptyForm = {
  name: '',
  description: '',
  client_id: '',
  status: 'planning',
  priority: 'medium',
  start_date: '',
  end_date: '',
  budget: '',
};

export function ProjectForm({ open, onOpenChange, onSave }: ProjectFormProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [taskPreview, setTaskPreview] = useState<{ title: string; priority: string }[]>([]);

  const { data: clients = [] } = useClients();
  const { data: templates = [] } = useProjectTemplates();
  const clientOptions = clients.map(c => ({ value: c.id, label: c.company_name }));
  const templateOptions = [
    { value: '', label: 'Nessun modello' },
    ...templates.map(t => ({ value: t.id, label: t.name })),
  ];

  useEffect(() => {
    if (!selectedTemplate) {
      setTaskPreview([]);
      return;
    }
    const tpl = templates.find(t => t.id === selectedTemplate);
    if (tpl) {
      setForm(prev => ({
        ...prev,
        name: prev.name || tpl.name,
        description: tpl.description || prev.description,
        priority: tpl.priority || prev.priority,
        budget: tpl.budget ? String(tpl.budget) : prev.budget,
      }));
      setTaskPreview(tpl.default_tasks || []);
    }
  }, [selectedTemplate, templates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      { ...form, budget: form.budget ? parseFloat(form.budget) : undefined } as Partial<Project>,
      taskPreview.length > 0 ? taskPreview : undefined,
    );
    setForm({ ...emptyForm });
    setSelectedTemplate('');
    setTaskPreview([]);
    onOpenChange(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setForm({ ...emptyForm }); setSelectedTemplate(''); setTaskPreview([]); } onOpenChange(o); }}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Progetto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template selector */}
          {templates.length > 0 && (
            <div className="p-3 rounded-2xl bg-muted/50 border border-border/50">
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <FileStack className="h-4 w-4 text-muted-foreground" />
                Usa un modello
              </label>
              <Select options={templateOptions} value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} />
              {taskPreview.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">{taskPreview.length} task predefinite</span> verranno create automaticamente
                </div>
              )}
            </div>
          )}

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

          {/* Task preview */}
          {taskPreview.length > 0 && (
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
              <p className="text-sm font-medium mb-2">Task che verranno create:</p>
              <div className="space-y-1">
                {taskPreview.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{i + 1}. {t.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit">Crea Progetto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
