import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { useProjectTemplates, useCreateProjectTemplate, useUpdateProjectTemplate, useDeleteProjectTemplate } from '@/hooks/useProjectTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectTemplate } from '@/types';
import {
  FileStack, Plus, Pencil, Trash2, Save, X, CheckCircle2
} from 'lucide-react';

const statusFilterOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'planning', label: 'Pianificazione' },
  { value: 'active', label: 'Attivo' },
  { value: 'paused', label: 'In pausa' },
  { value: 'completed', label: 'Completato' },
  { value: 'archived', label: 'Archiviato' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

export default function Projects() {
  const [formOpen, setFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();
  const { data: clients = [] } = useClients();
  const { data: templates = [] } = useProjectTemplates();
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTemplate = useCreateProjectTemplate();
  const updateTemplate = useUpdateProjectTemplate();
  const deleteTemplate = useDeleteProjectTemplate();
  const { profile } = useAuth();

  const filteredProjects = projects.filter(p =>
    !statusFilter || p.status === statusFilter
  );

  const handleCreateProject = async (project: Partial<Project>, taskTitles?: { title: string; priority: string }[]) => {
    createProject.mutate({ ...project, created_by: profile?.id }, {
      onSuccess: async (newProject) => {
        if (taskTitles && taskTitles.length > 0 && supabase && newProject?.id) {
          const tasksToInsert = taskTitles.map((t, i) => ({
            project_id: newProject.id,
            title: t.title,
            priority: t.priority,
            status: 'todo',
            position: i,
          }));
          await supabase.from('tasks').insert(tasksToInsert);
        }
      }
    });
  };

  return (
    <div>
      <Header
        title="Progetti"
        onQuickAdd={() => setFormOpen(true)}
        quickAddLabel="Nuovo Progetto"
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <Select
            options={statusFilterOptions}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-48"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            className="gap-2"
          >
            <FileStack className="h-4 w-4" />
            Modelli ({templates.length})
          </Button>
        </div>

        {/* Templates section */}
        {showTemplates && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileStack className="h-5 w-5" />
                  Modelli di Progetto
                </CardTitle>
                <CardDescription>Crea modelli riutilizzabili con task predefinite</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingTemplate(null); setTemplateFormOpen(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Nuovo Modello
              </Button>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun modello creato. Crea il primo per velocizzare la creazione di nuovi progetti!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {templates.map(tpl => (
                    <div key={tpl.id} className="rounded-2xl border border-border p-4 bg-card hover:shadow-soft transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{tpl.name}</h4>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingTemplate(tpl); setTemplateFormOpen(true); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Eliminare il modello "${tpl.name}"?`)) {
                                deleteTemplate.mutate(tpl.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {tpl.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{tpl.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded-full bg-muted">{tpl.priority}</span>
                        {tpl.budget && <span>{tpl.budget} &euro;</span>}
                        {tpl.default_tasks?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {tpl.default_tasks.length} task
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

      {formOpen && (
        <ProjectForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSave={handleCreateProject}
        />
      )}

      {templateFormOpen && (
        <TemplateFormModal
          open={templateFormOpen}
          onOpenChange={setTemplateFormOpen}
          template={editingTemplate}
          onSave={(data) => {
            if (editingTemplate) {
              updateTemplate.mutate({ id: editingTemplate.id, ...data });
            } else {
              createTemplate.mutate({ ...data, created_by: profile?.id });
            }
            setTemplateFormOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ── Template Form Modal ──
interface TemplateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ProjectTemplate | null;
  onSave: (data: Partial<ProjectTemplate>) => void;
}

function TemplateFormModal({ open, onOpenChange, template, onSave }: TemplateFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [budget, setBudget] = useState('');
  const [taskList, setTaskList] = useState<{ title: string; priority: string }[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Sync form when template prop changes or modal opens
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setPriority(template.priority);
      setBudget(template.budget ? String(template.budget) : '');
      setTaskList(template.default_tasks || []);
    } else {
      setName('');
      setDescription('');
      setPriority('medium');
      setBudget('');
      setTaskList([]);
    }
  }, [template, open]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTaskList(prev => [...prev, { title: newTask.trim(), priority: newTaskPriority }]);
    setNewTask('');
    setNewTaskPriority('medium');
  };

  const removeTask = (idx: number) => {
    setTaskList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      priority: priority as ProjectTemplate['priority'],
      budget: budget ? parseFloat(budget) : null,
      default_tasks: taskList,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Modifica Modello' : 'Nuovo Modello di Progetto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome Modello *</label>
            <Input value={name} onChange={e => setName(e.target.value)} required placeholder="es. Consulenza Marketing Base" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Descrizione</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Descrizione del tipo di progetto..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Priorità Default</label>
              <Select options={priorityOptions} value={priority} onChange={e => setPriority(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Budget Default</label>
              <Input type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          {/* Task list */}
          <div>
            <label className="text-sm font-medium mb-2 block">Task Predefinite</label>
            {taskList.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {taskList.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border/50">
                    <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm">{t.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t.priority}</span>
                    <button type="button" onClick={() => removeTask(i)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Titolo task..."
                className="flex-1"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }}
              />
              <Select
                options={priorityOptions}
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value)}
                className="w-28"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTask} className="shrink-0 h-11 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={!name.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              {template ? 'Salva Modifiche' : 'Crea Modello'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
