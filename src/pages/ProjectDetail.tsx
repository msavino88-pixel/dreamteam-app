import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/useProjects';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { statusLabels, priorityLabels, formatCurrency, formatDate } from '@/lib/formatting';
import { ArrowLeft, Calendar, Euro, CheckCircle2, FolderKanban } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id);
  const { data: tasks = [] } = useTasks(id);
  const { data: clients = [] } = useClients();
  const updateTask = useUpdateTask();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai progetti
        </Button>
        <p className="mt-4 text-muted-foreground">Progetto non trovato</p>
      </div>
    );
  }

  const client = clients.find(c => c.id === project.client_id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div>
      <Header title={project.name} />
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="text-foreground/50 hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Tutti i progetti
        </Button>

        {/* Header - dark card */}
        <div className="rounded-2xl bg-[#1a1a1e] text-white p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10">
              <FolderKanban className="h-7 w-7 text-white/60" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{project.name}</h2>
                <span className="text-xs text-white/40 bg-white/10 rounded-full px-2.5 py-0.5">{statusLabels[project.status]}</span>
                <span className="text-xs text-white/40 bg-white/5 rounded-full px-2.5 py-0.5">{priorityLabels[project.priority]}</span>
              </div>
              {client && (
                <p className="text-white/40 cursor-pointer hover:text-white/60 transition-colors" onClick={() => navigate(`/clients/${client.id}`)}>
                  {client.company_name}
                </p>
              )}
              {project.description && <p className="text-sm text-white/30 mt-1">{project.description}</p>}
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/5 p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-white/30" />
              <div>
                <p className="text-[11px] text-white/30">Timeline</p>
                <p className="text-sm font-medium text-white/80">{formatDate(project.start_date)} - {formatDate(project.end_date)}</p>
              </div>
            </div>
            {project.budget && (
              <div className="rounded-xl bg-white/5 p-4 flex items-center gap-3">
                <Euro className="h-5 w-5 text-white/30" />
                <div>
                  <p className="text-[11px] text-white/30">Budget</p>
                  <p className="text-sm font-medium text-white/80">{formatCurrency(project.budget)}</p>
                </div>
              </div>
            )}
            <div className="rounded-xl bg-white/5 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-white/30" />
              <div>
                <p className="text-[11px] text-white/30">Task</p>
                <p className="text-sm font-medium text-white/80">{completedTasks}/{tasks.length} completate</p>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-[11px] text-white/30 mb-2">Progresso</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--dt-branding)' }} />
                </div>
                <span className="text-sm font-semibold text-white/70">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Board - dark card */}
        <div className="rounded-2xl bg-[#1a1a1e] text-white p-6">
          <h3 className="text-base font-semibold text-white mb-4">Board Task</h3>
          <TaskBoard tasks={tasks} onStatusChange={(taskId, newStatus) => {
            updateTask.mutate({
              id: taskId,
              status: newStatus,
              completed_at: newStatus === 'done' ? new Date().toISOString() : null,
            });
          }} />
        </div>
      </div>
    </div>
  );
}
