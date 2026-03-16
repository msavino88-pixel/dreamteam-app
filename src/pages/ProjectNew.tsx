import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';
import { useCreateProject } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function ProjectNew() {
  const navigate = useNavigate();
  const { data: clients = [] } = useClients();
  const createProject = useCreateProject();
  const { profile } = useAuth();
  const [form, setForm] = useState({
    name: '', description: '', client_id: '',
    status: 'planning', priority: 'medium',
    start_date: '', end_date: '', budget: '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const clientOptions = clients.map(c => ({ value: c.id, label: c.company_name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({
      ...form,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      created_by: profile?.id,
    } as any, {
      onSuccess: () => navigate('/projects'),
    });
  };

  return (
    <div>
      <Header title="Nuovo Progetto" />
      <div className="p-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai progetti
        </Button>
        <Card>
          <CardHeader><CardTitle>Crea nuovo progetto</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome *</label>
                <Input value={form.name} onChange={e => update('name', e.target.value)} required autoFocus />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cliente *</label>
                <Select options={clientOptions} placeholder="Seleziona..." value={form.client_id} onChange={e => update('client_id', e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Descrizione</label>
                <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Priorità</label>
                  <Select options={[{value:'low',label:'Bassa'},{value:'medium',label:'Media'},{value:'high',label:'Alta'},{value:'urgent',label:'Urgente'}]} value={form.priority} onChange={e => update('priority', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Budget</label>
                  <Input type="number" value={form.budget} onChange={e => update('budget', e.target.value)} placeholder="0.00" />
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
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate('/projects')}>Annulla</Button>
                <Button type="submit">Crea Progetto</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
