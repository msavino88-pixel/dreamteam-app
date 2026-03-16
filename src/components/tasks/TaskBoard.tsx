import type { Task } from '@/types';
import { priorityLabels, formatDate } from '@/lib/formatting';
import { useUsers } from '@/hooks/useUsers';
import { Calendar, CheckCircle2 } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
}

const columns: { status: Task['status']; label: string; accentColor: string }[] = [
  { status: 'todo', label: 'Da Fare', accentColor: 'var(--dt-management)' },
  { status: 'in_progress', label: 'In Corso', accentColor: 'var(--dt-ai)' },
  { status: 'review', label: 'Revisione', accentColor: 'var(--dt-branding)' },
  { status: 'done', label: 'Fatto', accentColor: 'var(--dt-finance)' },
];

const priorityDotColors: Record<string, string> = {
  low: 'bg-white/20',
  medium: 'bg-[#7B9BBF]',
  high: 'bg-[#D5C8B8]',
  urgent: 'bg-[#D05A5A]',
};

export function TaskBoard({ tasks, onStatusChange }: TaskBoardProps) {
  const { data: users = [] } = useUsers();
  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(col => {
        const columnTasks = tasks
          .filter(t => t.status === col.status)
          .sort((a, b) => a.position - b.position);

        return (
          <div key={col.status} className="rounded-xl bg-white/5 p-3 relative overflow-hidden">
            {/* Accent top */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: col.accentColor }} />

            <div className="flex items-center justify-between mb-3 mt-1">
              <h3 className="text-sm font-semibold text-white/80">{col.label}</h3>
              <span className="text-[11px] text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-2">
              {columnTasks.map(task => {
                const assignee = users.find(u => u.id === task.assigned_to);
                return (
                  <div
                    key={task.id}
                    className="rounded-xl bg-[#1a1a1e] p-3.5 hover:bg-[#222226] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      {col.status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-white/30 mb-2.5 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${priorityDotColors[task.priority]}`} />
                        <span className="text-[10px] text-white/30">{priorityLabels[task.priority]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.due_date && (
                          <span className="text-[10px] text-white/25 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                        {assignee && (
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#9B8EBD] to-[#7B9BBF] flex items-center justify-center text-[8px] font-bold text-white" title={assignee.full_name}>
                            {assignee.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
