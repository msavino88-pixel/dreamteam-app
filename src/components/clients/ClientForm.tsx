import { useState } from 'react';
import type { Client, ClientStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Partial<Client>) => void;
  client?: Client;
}

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Attivo' },
  { value: 'inactive', label: 'Inattivo' },
  { value: 'churned', label: 'Perso' },
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

export function ClientForm({ open, onOpenChange, onSave, client }: ClientFormProps) {
  const [form, setForm] = useState({
    company_name: client?.company_name || '',
    contact_name: client?.contact_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    city: client?.city || '',
    industry: client?.industry || '',
    vat_number: client?.vat_number || '',
    website: client?.website || '',
    notes: client?.notes || '',
    status: (client?.status || 'lead') as ClientStatus,
    source: client?.source || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Strip empty strings → send only non-empty values
    const cleaned = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    ) as Partial<Client>;
    onSave(cleaned);
    onOpenChange(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? 'Modifica Cliente' : 'Nuovo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Azienda *</label>
              <Input value={form.company_name} onChange={e => update('company_name', e.target.value)} required />
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
              <label className="text-sm font-medium mb-1 block">Indirizzo</label>
              <Input value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Città</label>
              <Input value={form.city} onChange={e => update('city', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Settore</label>
              <Select options={industryOptions} placeholder="Seleziona..." value={form.industry} onChange={e => update('industry', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">P.IVA</label>
              <Input value={form.vat_number} onChange={e => update('vat_number', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sito web</label>
              <Input value={form.website} onChange={e => update('website', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stato</label>
              <Select options={statusOptions} value={form.status} onChange={e => update('status', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fonte</label>
              <Input value={form.source} onChange={e => update('source', e.target.value)} placeholder="Es: Referral, LinkedIn, Evento..." />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Note</label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit">{client ? 'Salva Modifiche' : 'Aggiungi Cliente'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
