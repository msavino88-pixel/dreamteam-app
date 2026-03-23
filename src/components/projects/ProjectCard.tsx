import { useNavigate } from 'react-router-dom';
import type { Project, Task, Client } from '@/types';
import { statusLabels, priorityLabels, formatCurrency, formatDate } from '@/lib/formatting';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu';
import { FolderKanban, Calendar, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  clients?: Client[];
  onEdit?: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const priorityDotColors: Record<string, string> = {
  low: 'bg-muted-foreground/30',
  medium: 'bg-[#7B9BBF]',
  high: 'bg-[#D5C8B8]',
  urgent: 'bg-[#D05A5A]',
};

export function ProjectCard({ project, tasks: allTasks = [], clients: allClients = [], onEdit, onArchive, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const client = allClients.find(c => c.id === project.client_id);
  const tasks = allTasks.filter(t => t.project_id === project.id);
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div
      className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-6 cursor-pointer hover:shadow-float transition-all duration-300 hover:scale-[1.01]"
      onClick={() => navigate(`/projects/${project.id}`)}
    >

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
          {(onEdit || onArchive || onDelete) && (
            <DropdownMenu trigger={<button className="p-1 rounded-lg hover:bg-muted transition-colors"><MoreVertical className="h-3.5 w-3.5 text-muted-foreground" /></button>}>
              {onEdit && <DropdownItem onClick={() => onEdit(project)}><Pencil className="h-3.5 w-3.5" /> Modifica</DropdownItem>}
              {onArchive && <DropdownItem onClick={() => onArchive(project)}><Archive className="h-3.5 w-3.5" /> {project.status === 'archived' ? 'Riattiva' : 'Archivia'}</DropdownItem>}
              {onDelete && <DropdownItem onClick={() => onDelete(project)} variant="danger"><Trash2 className="h-3.5 w-3.5" /> Elimina</DropdownItem>}
            </DropdownMenu>
          )}
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
            className="h-full rounded-full transition-all duration-300 bg-primary"
            style={{ width: `${progress}%` }}
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
