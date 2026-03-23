import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useAllTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { formatDate, priorityLabels } from '@/lib/formatting';
import { CheckCircle2, Calendar, ArrowRight, FolderKanban } from 'lucide-react';

const priorityColors: Record<string, string> = {
  low: 'bg-muted-foreground/20',
  medium: 'bg-[#7B9BBF]',
  high: 'bg-[#D5C8B8]',
  urgent: 'bg-[#D05A5A]',
};


export default function MyWork() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: tasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();

  const myTasks = tasks.filter(t => t.assigned_to === profile?.id && t.status !== 'done');
  const myDoneTasks = tasks.filter(t => t.assigned_to === profile?.id && t.status === 'done').slice(0, 5);
  const myProjects = projects.filter(p =>
    p.created_by === profile?.id && (p.status === 'active' || p.status === 'planning')
  );

  // Sort by priority then due date
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedTasks = [...myTasks].sort((a, b) => {
    const pDiff = (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
    if (pDiff !== 0) return pDiff;
    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    return a.due_date ? -1 : 1;
  });

  return (
    <div>
      <Header title="Il Mio Lavoro" />
      <div className="p-4 md:p-6 space-y-6">
        {/* My Projects */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">I Miei Progetti</h2>
          {myProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun progetto assegnato</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {myProjects.map(project => {
                const client = clients.find(c => c.id === project.client_id);
                const projectTasks = tasks.filter(t => t.project_id === project.id);
                const completed = projectTasks.filter(t => t.status === 'done').length;
                const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;

                return (
                  <div
                    key={project.id}
                    className="bg-card rounded-2xl p-4 border border-border shadow-sm cursor-pointer hover:shadow-md transition-all"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl bg-muted p-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                        {client && <p className="text-xs text-muted-foreground">{client.company_name}</p>}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{completed}/{projectTasks.length} task</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Active Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Le Mie Task <span className="text-sm font-normal text-muted-foreground">({myTasks.length} aperte)</span>
          </h2>
          <div className="space-y-2">
            {sortedTasks.map(task => {
              const project = projects.find(p => p.id === task.project_id);
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();
              return (
                <div
                  key={task.id}
                  className="bg-card rounded-xl p-3 md:p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                  onClick={() => project && navigate(`/projects/${project.id}`)}
                >
                  <div className={`h-3 w-3 rounded-full shrink-0 ${priorityColors[task.priority]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {project?.name} | {priorityLabels[task.priority]}
                    </p>
                  </div>
                  {task.due_date && (
                    <div className={`flex items-center gap-1 text-xs shrink-0 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      <Calendar className="h-3 w-3" />
                      <span className="hidden sm:inline">{formatDate(task.due_date)}</span>
                      <span className="sm:hidden">{new Date(task.due_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Completed */}
        {myDoneTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Completate di Recente</h2>
            <div className="space-y-2">
              {myDoneTasks.map(task => (
                <div key={task.id} className="bg-card rounded-xl p-3 border border-border shadow-sm flex items-center gap-3 opacity-60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-sm line-through truncate">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
