import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients';
import { useAllSpending } from '@/hooks/useSpending';
import { useInteractions } from '@/hooks/useInteractions';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';

const statusFilterOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'active', label: 'Attivi' },
  { value: 'lead', label: 'Lead' },
  { value: 'inactive', label: 'Inattivi' },
  { value: 'churned', label: 'Persi' },
];

export default function Clients() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const { data: clients = [] } = useClients();
  const { data: spending = [] } = useAllSpending();
  const { data: interactions = [] } = useInteractions();
  const { data: users = [] } = useUsers();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const { profile } = useAuth();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const industryFilterOptions = useMemo(() => [
    { value: '', label: 'Tutti i settori' },
    ...Array.from(new Set(clients.map(c => c.industry).filter(Boolean))).map(i => ({
      value: i!,
      label: i!,
    })),
  ], [clients]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = !search ||
      client.company_name.toLowerCase().includes(search.toLowerCase()) ||
      client.contact_name.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || client.status === statusFilter;
    const matchesIndustry = !industryFilter || client.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  return (
    <div>
      <Header
        title="Clienti"
        onQuickAdd={() => setFormOpen(true)}
        quickAddLabel="Nuovo Cliente"
      />
      <div className="p-4 md:p-6 space-y-4">
        {/* Filtri */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca clienti..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={industryFilterOptions}
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="w-48"
          />
        </div>

        {/* Conteggio */}
        <p className="text-sm text-muted-foreground">
          {filteredClients.length} client{filteredClients.length !== 1 ? 'i' : 'e'} trovat{filteredClients.length !== 1 ? 'i' : 'o'}
        </p>

        {/* Griglia clienti */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              spending={spending}
              interactions={interactions}
              users={users}
              onEdit={(c) => navigate(`/clients/${c.id}`)}
              onArchive={(c) => updateClient.mutate({ id: c.id, status: c.status === 'inactive' ? 'active' : 'inactive' })}
              onDelete={(c) => {
                if (confirmDeleteId === c.id) {
                  deleteClient.mutate(c.id);
                  setConfirmDeleteId(null);
                } else {
                  setConfirmDeleteId(c.id);
                  setTimeout(() => setConfirmDeleteId(null), 3000);
                }
              }}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-1">Nessun cliente trovato</p>
            <p className="text-sm">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </div>

      <ClientForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={(client) => createClient.mutate({ ...client, created_by: profile?.id, assigned_to: profile?.id })}
      />
    </div>
  );
}
