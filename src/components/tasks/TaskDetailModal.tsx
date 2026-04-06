import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useSubtasks, useCreateSubtask, useToggleSubtask, useDeleteSubtask } from '@/hooks/useSubtasks';
import { formatRelativeDate, priorityLabels } from '@/lib/formatting';
import type { Task } from '@/types';
import {
  CheckCircle2, Circle, Plus, Trash2, Send,
  Calendar, User, Flag, MessageSquare, ListChecks, Clock
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updates: Partial<Task> & { id: string }) => void;
}

const statusOptions = [
  { value: 'todo', label: 'Da Fare' },
  { value: 'in_progress', label: 'In Corso' },
  { value: 'review', label: 'Revisione' },
  { value: 'done', label: 'Fatto' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export function TaskDetailModal({ task, open, onOpenChange, onUpdate }: TaskDetailModalProps) {
  const { profile } = useAuth();
  const { data: users = [] } = useUsers();
  const { data: comments = [] } = useComments('task', task?.id);
  const { data: subtasks = [] } = useSubtasks(task?.id);
  const createComment = useCreateComment();
  const createSubtask = useCreateSubtask();
  const toggleSubtask = useToggleSubtask();
  const deleteSubtask = useDeleteSubtask();

  const [commentText, setCommentText] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  if (!task) return null;

  const assignee = users.find(u => u.id === task.assigned_to);
  const userOptions = [{ value: '', label: 'Non assegnata' }, ...users.map(u => ({ value: u.id, label: u.full_name }))];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const handleSendComment = () => {
    if (!commentText.trim() || !profile) return;
    createComment.mutate({
      entity_type: 'task',
      entity_id: task.id,
      user_id: profile.id,
      content: commentText.trim(),
    });
    setCommentText('');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    createSubtask.mutate({
      task_id: task.id,
      title: newSubtask.trim(),
      position: subtasks.length,
    });
    setNewSubtask('');
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate({ id: task.id, title: editTitle, description: editDesc || null });
    setEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Dettaglio Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Title & Description */}
          {editing ? (
            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-lg font-semibold"
                autoFocus
              />
              <Textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Descrizione..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>Salva</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Annulla</Button>
              </div>
            </div>
          ) : (
            <div className="cursor-pointer group" onClick={startEdit}>
              <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">{task.title}</h2>
              {task.description ? (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50 mt-1 italic">Clicca per aggiungere una descrizione...</p>
              )}
            </div>
          )}

          {/* Status, Priority, Assignee, Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Flag className="h-3 w-3" /> Stato
              </label>
              <Select
                options={statusOptions}
                value={task.status}
                onChange={e => onUpdate({
                  id: task.id,
                  status: e.target.value as Task['status'],
                  completed_at: e.target.value === 'done' ? new Date().toISOString() : null,
                })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Flag className="h-3 w-3" /> Priorita
              </label>
              <Select
                options={priorityOptions}
                value={task.priority}
                onChange={e => onUpdate({ id: task.id, priority: e.target.value as Task['priority'] })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <User className="h-3 w-3" /> Assegnata a
              </label>
              <Select
                options={userOptions}
                value={task.assigned_to || ''}
                onChange={e => onUpdate({ id: task.id, assigned_to: e.target.value || null })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" /> Scadenza
              </label>
              <Input
                type="date"
                value={task.due_date?.slice(0, 10) || ''}
                onChange={e => onUpdate({ id: task.id, due_date: e.target.value || null })}
              />
            </div>
          </div>

          {/* Time tracking */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3" /> Ore Stimate
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={task.estimated_hours ?? ''}
                onChange={e => onUpdate({ id: task.id, estimated_hours: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3" /> Ore Lavorate
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={task.logged_hours ?? ''}
                onChange={e => onUpdate({ id: task.id, logged_hours: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4" />
              Sotto-task
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}
            </h3>

            {subtasks.length > 0 && (
              <div className="h-1.5 w-full rounded-full bg-muted mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleSubtask.mutate({ id: st.id, completed: !st.completed, taskId: task.id })}
                    className="shrink-0"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  <span className={`text-sm flex-1 ${st.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {st.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask.mutate({ id: st.id, taskId: task.id })}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Aggiungi sotto-task..."
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                className="text-sm"
              />
              <Button size="sm" variant="outline" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4" />
              Commenti
              {comments.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">{comments.length}</span>
              )}
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Nessun commento ancora</p>
              )}
              {comments.map(c => {
                const author = users.find(u => u.id === c.user_id);
                return (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9B8EBD] to-[#7B9BBF] text-[9px] font-bold text-white">
                      {author?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium">{author?.full_name || 'Utente'}</span>
                        <span className="text-[10px] text-muted-foreground">{formatRelativeDate(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-card-foreground/80 mt-0.5">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Scrivi un commento..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendComment())}
                className="text-sm"
              />
              <Button size="sm" onClick={handleSendComment} disabled={!commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
