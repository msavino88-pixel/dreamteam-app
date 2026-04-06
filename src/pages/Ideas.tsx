import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { IdeaQuickAdd } from '@/components/ideas/IdeaQuickAdd';
import { Select } from '@/components/ui/select';
import { useIdeas, useCreateIdea, useVoteIdea, useUpdateIdea, useDeleteIdea } from '@/hooks/useIdeas';
import { useUsers } from '@/hooks/useUsers';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const statusFilterOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'new', label: 'Nuove' },
  { value: 'evaluating', label: 'In valutazione' },
  { value: 'approved', label: 'Approvate' },
  { value: 'rejected', label: 'Rifiutate' },
  { value: 'implemented', label: 'Implementate' },
];

const sortOptions = [
  { value: 'votes', label: 'Più votate' },
  { value: 'recent', label: 'Più recenti' },
];

export default function Ideas() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('votes');
  const { data: ideas = [] } = useIdeas();
  const { data: users = [] } = useUsers();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createIdea = useCreateIdea();
  const voteIdea = useVoteIdea();
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  let filteredIdeas = ideas.filter(i => !statusFilter || i.status === statusFilter);

  if (sort === 'votes') {
    filteredIdeas = [...filteredIdeas].sort((a, b) => b.votes - a.votes);
  } else {
    filteredIdeas = [...filteredIdeas].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return (
    <div>
      <Header
        title="Idee"
        onQuickAdd={() => setQuickAddOpen(true)}
        quickAddLabel="Nuova Idea"
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex gap-3">
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={sortOptions}
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="w-40"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredIdeas.length} ide{filteredIdeas.length !== 1 ? 'e' : 'a'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onVote={(id) => voteIdea.mutate(id)}
              onEdit={(i) => {
                // TODO: open edit modal
              }}
              onStatusChange={(i, status) => updateIdea.mutate({ id: i.id, status: status as any })}
              onDelete={(i) => {
                if (window.confirm(`Eliminare l'idea "${i.title}"? Questa azione è irreversibile.`)) {
                  deleteIdea.mutate(i.id);
                }
              }}
              onConvertToProject={(i) => {
                updateIdea.mutate({ id: i.id, status: 'implemented' as any });
                navigate(`/projects/new?name=${encodeURIComponent(i.title)}&description=${encodeURIComponent(i.description || '')}`);
              }}
              users={users}
              clients={clients}
              projects={projects}
            />
          ))}
        </div>
      </div>

      <IdeaQuickAdd
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSave={(idea) => {
          if (profile) {
            createIdea.mutate({ ...idea, author_id: profile.id, status: 'new', votes: 0 });
          }
        }}
      />
    </div>
  );
}
