import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateClient } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Attivo' },
  { value: 'inactive', label: 'Inattivo' },
];

const industryOptions = [
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Energia', label: 'Energia' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
  { value: 'Moda', label: 'Moda' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Finanza', label: 'Finanza' },
  { value: 'Sanità', label: 'Sanità' },
  { value: 'Immobiliare', label: 'Immobiliare' },
  { value: 'Altro', label: 'Altro' },
];

export default function ClientNew() {
  const navigate = useNavigate();
  const createClient = useCreateClient();
  const { profile } = useAuth();
  const [form, setForm] = useState({
    company_name: '', contact_name: '', email: '', phone: '',
    address: '', city: '', industry: '', vat_number: '',
    website: '', notes: '', status: 'lead', source: '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate(
      { ...form, status: form.status as 'lead' | 'active' | 'inactive', created_by: profile?.id, assigned_to: profile?.id },
      { onSuccess: () => navigate('/clients') }
    );
  };

  return (
    <div>
      <Header title="Nuovo Cliente" />
      <div className="p-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai clienti
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Inserisci nuovo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Azienda *</label>
                  <Input value={form.company_name} onChange={e => update('company_name', e.target.value)} required autoFocus />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Referente *</label>
                  <Input value={form.contact_name} onChange={e => update('contact_name', e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefono</label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Settore</label>
                  <Select options={industryOptions} placeholder="Seleziona..." value={form.industry} onChange={e => update('industry', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Stato</label>
                  <Select options={statusOptions} value={form.status} onChange={e => update('status', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Città</label>
                  <Input value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Fonte</label>
                  <Input value={form.source} onChange={e => update('source', e.target.value)} placeholder="Referral, LinkedIn, Evento..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Note</label>
                <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate('/clients')}>Annulla</Button>
                <Button type="submit">Aggiungi Cliente</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
