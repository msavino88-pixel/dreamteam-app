import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useTasks, useUpdateTask, useCreateTask } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { useUsers } from '@/hooks/useUsers';
import { useProjectUpdates, useCreateProjectUpdate } from '@/hooks/useProjectUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { statusLabels, priorityLabels, formatCurrency, formatDate, formatRelativeDate } from '@/lib/formatting';
import type { Task } from '@/types';
import {
  ArrowLeft, Calendar, Euro, CheckCircle2, FolderKanban,
  Send, FileText, Upload, Download, Trash2, Plus, User
} from 'lucide-react';

const priorityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: project, isLoading } = useProject(id);
  const { data: tasks = [] } = useTasks(id);
  const { data: clients = [] } = useClients();
  const { data: users = [] } = useUsers();
  const { data: updates = [] } = useProjectUpdates(id);
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const updateProject = useUpdateProject();
  const createUpdate = useCreateProjectUpdate();

  const [updateText, setUpdateText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Add task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

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

  const handleSendUpdate = () => {
    if (!updateText.trim() || !profile || !id) return;
    createUpdate.mutate({
      project_id: id,
      user_id: profile.id,
      content: updateText.trim(),
    });
    setUpdateText('');
  };

  const handleUploadContract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !id) return;
    setUploading(true);
    try {
      const path = `contracts/${id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from('contracts').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(path);
      await updateProject.mutateAsync({ id, contract_url: urlData.publicUrl });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveContract = () => {
    if (window.confirm('Rimuovere il contratto?')) {
      updateProject.mutate({ id: project.id, contract_url: null });
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !id) return;
    createTask.mutate({
      project_id: id,
      title: newTaskTitle.trim(),
      priority: newTaskPriority as Task['priority'],
      assigned_to: newTaskAssignee || null,
      status: 'todo',
      position: tasks.length,
    });
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskAssignee('');
  };

  const userOptions = [{ value: '', label: 'Non assegnata' }, ...users.map(u => ({ value: u.id, label: u.full_name }))];

  return (
    <div>
      <Header title={project.name} />
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="text-foreground/50 hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Tutti i progetti
        </Button>

        {/* Header card */}
        <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-7">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <FolderKanban className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-card-foreground">{project.name}</h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">{statusLabels[project.status]}</span>
                <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2.5 py-0.5">{priorityLabels[project.priority]}</span>
              </div>
              {client && (
                <p className="text-muted-foreground cursor-pointer hover:text-card-foreground/60 transition-colors" onClick={() => navigate(`/clients/${client.id}`)}>
                  {client.company_name}
                </p>
              )}
              {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-muted/50 p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Timeline</p>
                <p className="text-sm font-medium text-card-foreground/80">{formatDate(project.start_date)} - {formatDate(project.end_date)}</p>
              </div>
            </div>
            {project.budget && (
              <div className="rounded-xl bg-muted/50 p-4 flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Budget</p>
                  <p className="text-sm font-medium text-card-foreground/80">{formatCurrency(project.budget)}</p>
                </div>
              </div>
            )}
            <div className="rounded-xl bg-muted/50 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Task</p>
                <p className="text-sm font-medium text-card-foreground/80">{completedTasks}/{tasks.length} completate</p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-[11px] text-muted-foreground mb-2">Progresso</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-foreground/60" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-sm font-semibold text-card-foreground/70">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Upload */}
        <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-7">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" /> Contratto
          </h3>
          {project.contract_url ? (
            <div className="flex items-center gap-3">
              <a
                href={project.contract_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:underline"
              >
                <Download className="h-4 w-4" /> Scarica contratto
              </a>
              <Button variant="ghost" size="sm" onClick={handleRemoveContract} className="text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg" className="hidden" onChange={handleUploadContract} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
                <Upload className="h-4 w-4" /> {uploading ? 'Caricamento...' : 'Carica Contratto'}
              </Button>
            </div>
          )}
        </div>

        {/* Add Task */}
        <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-7">
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Plus className="h-5 w-5 text-muted-foreground" /> Aggiungi Task
          </h3>
          <div className="flex flex-wrap gap-2">
            <Input
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Titolo task..."
              className="flex-1 min-w-[200px]"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTask())}
            />
            <Select options={priorityOptions} value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)} className="w-32" />
            <Select options={userOptions} value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} className="w-48" />
            <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="gap-1.5 h-11">
              <Plus className="h-4 w-4" /> Aggiungi
            </Button>
          </div>
        </div>

        {/* Task Board */}
        <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-7">
          <h3 className="text-base font-semibold text-card-foreground mb-4">Board Task</h3>
          <TaskBoard
            tasks={tasks}
            onStatusChange={(taskId, newStatus) => {
              updateTask.mutate({
                id: taskId,
                status: newStatus,
                completed_at: newStatus === 'done' ? new Date().toISOString() : null,
              });
            }}
            onUpdateTask={(updates) => {
              updateTask.mutate(updates);
            }}
          />
        </div>

        {/* Activity / Updates Log */}
        <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-7">
          <h3 className="text-base font-semibold mb-4">Aggiornamenti Progetto</h3>

          {/* Post update */}
          <div className="flex gap-2 mb-5">
            <Textarea
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              placeholder="Scrivi un aggiornamento..."
              rows={2}
              className="flex-1"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendUpdate(); }
              }}
            />
            <Button onClick={handleSendUpdate} disabled={!updateText.trim() || createUpdate.isPending} className="self-end gap-2">
              <Send className="h-4 w-4" /> Pubblica
            </Button>
          </div>

          {/* Updates list */}
          <div className="space-y-4">
            {updates.length === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nessun aggiornamento ancora</p>
            )}
            {updates.map(upd => {
              const author = users.find(u => u.id === upd.user_id);
              return (
                <div key={upd.id} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-[9px] font-bold text-white">
                    {author?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-medium">{author?.full_name || 'Utente'}</span>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeDate(upd.created_at)}</span>
                    </div>
                    <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{upd.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
