import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Select } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';

const statusFilterOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'planning', label: 'Pianificazione' },
  { value: 'active', label: 'Attivo' },
  { value: 'paused', label: 'In pausa' },
  { value: 'completed', label: 'Completato' },
  { value: 'archived', label: 'Archiviato' },
];

export default function Projects() {
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();
  const { data: clients = [] } = useClients();
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { profile } = useAuth();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p =>
    !statusFilter || p.status === statusFilter
  );

  return (
    <div>
      <Header
        title="Progetti"
        onQuickAdd={() => setFormOpen(true)}
        quickAddLabel="Nuovo Progetto"
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex gap-3">
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredProjects.length} progett{filteredProjects.length !== 1 ? 'i' : 'o'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              clients={clients}
              onEdit={(p) => navigate(`/projects/${p.id}`)}
              onArchive={(p) => updateProject.mutate({ id: p.id, status: p.status === 'archived' ? 'active' : 'archived' })}
              onDelete={(p) => {
                if (window.confirm(`Eliminare il progetto "${p.name}"? Questa azione è irreversibile.`)) {
                  deleteProject.mutate(p.id);
                }
              }}
            />
          ))}
        </div>
      </div>

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={(project) => createProject.mutate({ ...project, created_by: profile?.id })}
      />
    </div>
  );
}
