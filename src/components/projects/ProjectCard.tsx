import { useNavigate } from 'react-router-dom';
import type { Project, Task, Client } from '@/types';
import { statusLabels, priorityLabels, formatCurrency, formatDate } from '@/lib/formatting';
import { FolderKanban, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  clients?: Client[];
}

const priorityDotColors: Record<string, string> = {
  low: 'bg-muted-foreground/30',
  medium: 'bg-[#7B9BBF]',
  high: 'bg-[#D5C8B8]',
  urgent: 'bg-[#D05A5A]',
};

const statusBarColors: Record<string, string> = {
  planning: 'var(--dt-ai)',
  active: 'var(--dt-branding)',
  paused: 'var(--dt-management)',
  completed: 'var(--dt-finance)',
  archived: 'var(--dt-hr)',
};

export function ProjectCard({ project, tasks: allTasks = [], clients: allClients = [] }: ProjectCardProps) {
  const navigate = useNavigate();
  const client = allClients.find(c => c.id === project.client_id);
  const tasks = allTasks.filter(t => t.project_id === project.id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div
      className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border p-5 cursor-pointer hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01] relative overflow-hidden"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: statusBarColors[project.status] }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-muted p-2.5">
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-card-foreground">{project.name}</h3>
            {client && <p className="text-xs text-muted-foreground">{client.company_name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{statusLabels[project.status]}</span>
          <div className={`h-2 w-2 rounded-full ${priorityDotColors[project.priority]}`} title={priorityLabels[project.priority]} />
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-muted-foreground">{completedTasks}/{tasks.length} task</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: statusBarColors[project.status] }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
        </div>
        {project.budget && (
          <span className="font-semibold text-card-foreground/70">{formatCurrency(project.budget)}</span>
        )}
      </div>
    </div>
  );
}
