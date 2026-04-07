import { useState, useEffect } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, TouchSensor, useSensor, useSensors,
  useDroppable,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Header } from '@/components/layout/Header';
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
import { statusLabels, priorityLabels, formatCurrency, formatDate } from '@/lib/formatting';
import type { Project, ProjectTemplate, ProjectStatus } from '@/types';
import {
  FileStack, Plus, Pencil, Trash2, Save, X, CheckCircle2,
  FolderKanban, Calendar, MoreVertical, Archive, GripVertical
} from 'lucide-react';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu';

const statusColumns: { status: ProjectStatus; label: string }[] = [
  { status: 'planning', label: 'Pianificazione' },
  { status: 'active', label: 'Attivo' },
  { status: 'paused', label: 'In Pausa' },
  { status: 'completed', label: 'Completato' },
];

const priorityOptions = [
  { value: 'low', label: 'Bassa' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const priorityDotColors: Record<string, string> = {
  low: 'bg-muted-foreground/30',
  medium: 'bg-gray-400',
  high: 'bg-[#D5C8B8]',
  urgent: 'bg-[#D05A5A]',
};

// ── Droppable Column Wrapper ──
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-w-[260px] md:min-w-0 md:flex-1 snap-start rounded-xl bg-muted/50 p-3 transition-colors ${isOver ? 'bg-muted/80 ring-2 ring-foreground/10' : ''}`}
    >
      {children}
    </div>
  );
}

// ── Draggable Project Card ──
function DraggableProjectCard({ project, tasks, clients, onNavigate, onDelete }: {
  project: Project;
  tasks: { project_id: string; status: string }[];
  clients: { id: string; company_name: string }[];
  onNavigate: () => void;
  onDelete?: () => void;
}) {
  const client = clients.find(c => c.id === project.client_id);
  const projectTasks = tasks.filter(t => t.project_id === project.id);
  const completed = projectTasks.filter(t => t.status === 'done').length;
  const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { type: 'project', project },
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
      className="rounded-2xl bg-card shadow-soft p-4 cursor-pointer hover:shadow-float transition-all group"
      onClick={onNavigate}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing touch-none shrink-0"
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold truncate">{project.name}</h4>
            <div className="flex items-center gap-1 shrink-0">
              <div className={`h-2 w-2 rounded-full ${priorityDotColors[project.priority]}`} />
              <DropdownMenu trigger={<button className="p-0.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}><MoreVertical className="h-3 w-3 text-muted-foreground" /></button>}>
                <DropdownItem onClick={onNavigate}><Pencil className="h-3.5 w-3.5" /> Dettaglio</DropdownItem>
                {onDelete && <DropdownItem variant="danger" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /> Elimina</DropdownItem>}
              </DropdownMenu>
            </div>
          </div>
          {client && <p className="text-[11px] text-muted-foreground truncate mb-2">{client.company_name}</p>}
          {projectTasks.length > 0 && (
            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-foreground/60 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{completed}/{projectTasks.length} task</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const proj = projects.find(p => p.id === event.active.id);
    if (proj) setActiveProject(proj);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProject(null);
    const { active, over } = event;
    if (!over) return;

    const projectId = active.id as string;
    const currentProject = projects.find(p => p.id === projectId);
    if (!currentProject) return;

    // Check if dropped on a column
    const overColumn = statusColumns.find(c => c.status === over.id);
    if (overColumn && overColumn.status !== currentProject.status) {
      updateProject.mutate({ id: projectId, status: overColumn.status });
      return;
    }

    // Check if dropped on another project
    const overProject = projects.find(p => p.id === over.id);
    if (overProject && overProject.status !== currentProject.status) {
      updateProject.mutate({ id: projectId, status: overProject.status });
    }
  };

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

  // Filter out archived for the board view
  const boardProjects = projects.filter(p => p.status !== 'archived');
  const archivedCount = projects.filter(p => p.status === 'archived').length;

  return (
    <div>
      <Header
        title="Progetti"
        onQuickAdd={() => setFormOpen(true)}
        quickAddLabel="Nuovo Progetto"
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'board' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('board')}
            >
              Board
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Griglia
            </Button>
          </div>
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

        {/* Board View - Kanban per status */}
        {viewMode === 'board' && (
          <>
            <p className="text-sm text-muted-foreground">
              {boardProjects.length} progett{boardProjects.length !== 1 ? 'i' : 'o'}
              {archivedCount > 0 && ` · ${archivedCount} archiviati`}
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 snap-x">
                {statusColumns.map(col => {
                  const columnProjects = boardProjects.filter(p => p.status === col.status);
                  return (
                    <DroppableColumn key={col.status} id={col.status}>
                      <SortableContext
                        id={col.status}
                        items={columnProjects.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-card-foreground/80">{col.label}</h3>
                          <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                            {columnProjects.length}
                          </span>
                        </div>
                        <div className="space-y-2 min-h-[60px]">
                          {columnProjects.map(project => (
                            <DraggableProjectCard
                              key={project.id}
                              project={project}
                              tasks={tasks}
                              clients={clients}
                              onNavigate={() => navigate(`/projects/${project.id}`)}
                              onDelete={() => {
                                if (window.confirm(`Eliminare "${project.name}"?`)) deleteProject.mutate(project.id);
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DroppableColumn>
                  );
                })}
              </div>
              <DragOverlay>
                {activeProject && (
                  <div className="rounded-xl bg-card border-2 border-accent p-3.5 shadow-2xl opacity-90 w-[260px]">
                    <p className="text-sm font-medium">{activeProject.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{statusLabels[activeProject.status]}</p>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <>
            <p className="text-sm text-muted-foreground">
              {projects.length} progett{projects.length !== 1 ? 'i' : 'o'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map(project => {
                const client = clients.find(c => c.id === project.client_id);
                const projectTasks = tasks.filter(t => t.project_id === project.id);
                const completed = projectTasks.filter(t => t.status === 'done').length;
                const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;

                return (
                  <div
                    key={project.id}
                    className="rounded-[28px] bg-card shadow-soft p-6 cursor-pointer hover:shadow-float transition-all hover:scale-[1.01]"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-muted p-2.5">
                          <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{project.name}</h3>
                          {client && <p className="text-xs text-muted-foreground">{client.company_name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{statusLabels[project.status]}</span>
                        <div className={`h-2 w-2 rounded-full ${priorityDotColors[project.priority]}`} />
                        <DropdownMenu trigger={<button className="p-1 rounded-lg hover:bg-muted transition-colors" onClick={e => e.stopPropagation()}><MoreVertical className="h-3.5 w-3.5 text-muted-foreground" /></button>}>
                          <DropdownItem onClick={() => navigate(`/projects/${project.id}`)}><Pencil className="h-3.5 w-3.5" /> Modifica</DropdownItem>
                          <DropdownItem onClick={() => updateProject.mutate({ id: project.id, status: project.status === 'archived' ? 'active' : 'archived' })}>
                            <Archive className="h-3.5 w-3.5" /> {project.status === 'archived' ? 'Riattiva' : 'Archivia'}
                          </DropdownItem>
                          <DropdownItem variant="danger" onClick={() => {
                            if (window.confirm(`Eliminare "${project.name}"?`)) deleteProject.mutate(project.id);
                          }}>
                            <Trash2 className="h-3.5 w-3.5" /> Elimina
                          </DropdownItem>
                        </DropdownMenu>
                      </div>
                    </div>
                    {project.description && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{project.description}</p>}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-muted-foreground">{completed}/{projectTasks.length} task</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-foreground/60" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                      </div>
                      {project.budget && <span className="font-semibold text-card-foreground/70">{formatCurrency(project.budget)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setPriority(template.priority);
      setBudget(template.budget ? String(template.budget) : '');
      setTaskList(template.default_tasks || []);
    } else {
      setName(''); setDescription(''); setPriority('medium'); setBudget(''); setTaskList([]);
    }
  }, [template, open]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTaskList(prev => [...prev, { title: newTask.trim(), priority: newTaskPriority }]);
    setNewTask(''); setNewTaskPriority('medium');
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
          <div>
            <label className="text-sm font-medium mb-2 block">Task Predefinite</label>
            {taskList.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {taskList.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border/50">
                    <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm">{t.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t.priority}</span>
                    <button type="button" onClick={() => setTaskList(prev => prev.filter((_, j) => j !== i))} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Titolo task..." className="flex-1"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }} />
              <Select options={priorityOptions} value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)} className="w-28" />
              <Button type="button" variant="outline" size="sm" onClick={addTask} className="shrink-0 h-11 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={!name.trim()} className="gap-2">
              <Save className="h-4 w-4" /> {template ? 'Salva Modifiche' : 'Crea Modello'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
