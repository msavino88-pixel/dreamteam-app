import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { priorityLabels, formatDate } from '@/lib/formatting';
import { useUsers } from '@/hooks/useUsers';
import { useAllSubtasks } from '@/hooks/useSubtasks';
import { TaskDetailModal } from './TaskDetailModal';
import { Calendar, CheckCircle2, MessageSquare, ListChecks, GripVertical } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onUpdateTask?: (updates: Partial<Task> & { id: string }) => void;
}

const columns: { status: Task['status']; label: string }[] = [
  { status: 'todo', label: 'Da Fare' },
  { status: 'in_progress', label: 'In Corso' },
  { status: 'review', label: 'Revisione' },
  { status: 'done', label: 'Fatto' },
];

const priorityDotColors: Record<string, string> = {
  low: 'bg-muted-foreground/30',
  medium: 'bg-[#7B9BBF]',
  high: 'bg-[#D5C8B8]',
  urgent: 'bg-[#D05A5A]',
};

function SortableTaskCard({ task, onClick, subtaskCount, subtaskDone }: {
  task: Task;
  onClick: () => void;
  subtaskCount: number;
  subtaskDone: number;
}) {
  const { data: users = [] } = useUsers();
  const assignee = users.find(u => u.id === task.assigned_to);
  const isOverdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl bg-card border-0 shadow-soft p-4 hover:shadow-float transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-1.5">
        <button
          className="mt-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing touch-none shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-sm font-medium text-card-foreground">{task.title}</p>
            {task.status === 'done' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
          </div>
          {task.description && (
            <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
          )}

          {/* Subtask progress */}
          {subtaskCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <ListChecks className="h-3 w-3 text-muted-foreground" />
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${subtaskCount > 0 ? (subtaskDone / subtaskCount) * 100 : 0}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{subtaskDone}/{subtaskCount}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${priorityDotColors[task.priority]}`} />
              <span className="text-[10px] text-muted-foreground">{priorityLabels[task.priority]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {task.due_date && (
                <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
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
      </div>
    </div>
  );
}

export function TaskBoard({ tasks, onStatusChange, onUpdateTask }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const taskIds = tasks.map(t => t.id);
  const { data: allSubtasks = [] } = useAllSubtasks(taskIds);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !onStatusChange) return;

    const taskId = active.id as string;
    // Determine target column
    const overTask = tasks.find(t => t.id === over.id);
    const overColumn = columns.find(c => c.status === over.id);

    if (overColumn) {
      // Dropped on column
      onStatusChange(taskId, overColumn.status);
    } else if (overTask && overTask.status !== tasks.find(t => t.id === taskId)?.status) {
      // Dropped on a task in different column
      onStatusChange(taskId, overTask.status);
    }
  };

  const handleUpdate = (updates: Partial<Task> & { id: string }) => {
    if (onUpdateTask) {
      onUpdateTask(updates);
    } else if (onStatusChange && updates.status) {
      onStatusChange(updates.id, updates.status);
    }
    // Update selected task locally for immediate UI feedback
    if (selectedTask && updates.id === selectedTask.id) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 snap-x">
          {columns.map(col => {
            const columnTasks = tasks
              .filter(t => t.status === col.status)
              .sort((a, b) => a.position - b.position);

            return (
              <SortableContext
                key={col.status}
                id={col.status}
                items={columnTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-w-[260px] md:min-w-0 md:flex-1 snap-start rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-card-foreground/80">{col.label}</h3>
                    <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[60px]">
                    {columnTasks.map(task => {
                      const taskSubtasks = allSubtasks.filter(s => s.task_id === task.id);
                      return (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setSelectedTask(task)}
                          subtaskCount={taskSubtasks.length}
                          subtaskDone={taskSubtasks.filter(s => s.completed).length}
                        />
                      );
                    })}
                  </div>
                </div>
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rounded-xl bg-card border-2 border-primary p-3.5 shadow-2xl opacity-90 w-[260px]">
              <p className="text-sm font-medium">{activeTask.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{priorityLabels[activeTask.priority]}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => { if (!open) setSelectedTask(null); }}
        onUpdate={handleUpdate}
      />
    </>
  );
}
