import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { IdeaQuickAdd } from '@/components/ideas/IdeaQuickAdd';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useTasks';
import { useAllSpending } from '@/hooks/useSpending';
import { useCreateIdea } from '@/hooks/useIdeas';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/formatting';
import {
  Users,
  FolderKanban,
  Euro,
  AlertTriangle,
  Plus,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [ideaOpen, setIdeaOpen] = useState(false);
  const { profile } = useAuth();

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();
  const { data: spending = [] } = useAllSpending();
  const createIdea = useCreateIdea();

  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalRevenue = spending
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + s.amount, 0);
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length;

  const recentProjects = projects
    .filter(p => p.status === 'active' || p.status === 'planning')
    .slice(0, 3);

  // AI-like insights (generated from data)
  const completedTasksThisWeek = tasks.filter(t => {
    if (!t.completed_at) return false;
    const d = new Date(t.completed_at);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const totalLoggedHours = tasks.reduce((sum, t) => sum + (t.logged_hours || 0), 0);

  const insights: string[] = [];
  if (overdueTasks > 0) insights.push(`Hai ${overdueTasks} task scadut${overdueTasks === 1 ? 'a' : 'e'} — prioritizzale per non perdere ritmo.`);
  if (completedTasksThisWeek > 5) insights.push(`Ottimo ritmo! ${completedTasksThisWeek} task completate questa settimana.`);
  if (activeProjects > 5) insights.push(`${activeProjects} progetti attivi: valuta di mettere in pausa quelli meno prioritari.`);
  const projectsEndingSoon = projects.filter(p => {
    if (p.status !== 'active' || !p.end_date) return false;
    const days = Math.ceil((new Date(p.end_date).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  });
  if (projectsEndingSoon.length > 0) insights.push(`${projectsEndingSoon.length} progett${projectsEndingSoon.length === 1 ? 'o' : 'i'} in scadenza entro 7 giorni.`);
  if (insights.length === 0) insights.push('Tutto sotto controllo! Nessuna criticità rilevata.');

  return (
    <div>
      <Header title="Dashboard" />
      <div className="px-4 md:px-6 space-y-5 md:space-y-6">
        {/* KPI - 2 columns mobile, 4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Clienti Attivi"
            value={activeClients}
            icon={Users}
            trend={{ value: 12, label: 'vs mese scorso' }}
          />
          <StatCard
            title="Progetti in Corso"
            value={activeProjects}
            icon={FolderKanban}
          />
          <StatCard
            title="Fatturato"
            value={formatCurrency(totalRevenue)}
            icon={Euro}
            trend={{ value: 8, label: 'vs trimestre' }}
          />
          <StatCard
            title="Task Scadute"
            value={overdueTasks}
            icon={AlertTriangle}
          />
        </div>

        {/* Quick Actions - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          <Button onClick={() => navigate('/clients/new')} className="gap-2 shrink-0 snap-start">
            <Plus className="h-4 w-4" /> Nuovo Cliente
          </Button>
          <Button variant="outline" onClick={() => navigate('/projects/new')} className="gap-2 shrink-0 snap-start">
            <Plus className="h-4 w-4" /> Nuovo Progetto
          </Button>
          <Button variant="outline" onClick={() => setIdeaOpen(true)} className="gap-2 shrink-0 snap-start">
            <Lightbulb className="h-4 w-4" /> Nuova Idea
          </Button>
        </div>

        {/* AI Insights */}
        <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-xl bg-foreground/60/10 p-2">
              <Sparkles className="h-4 w-4 text-foreground" />
            </div>
            <h3 className="text-base font-semibold">AI Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((insight, i) => (
              <div key={i} className="rounded-xl bg-muted/40 p-3 text-sm text-card-foreground/80">
                {insight}
              </div>
            ))}
            <div className="rounded-xl bg-muted/40 p-3 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span><strong>{totalLoggedHours.toFixed(1)}</strong> ore tracciate totali</span>
            </div>
            <div className="rounded-xl bg-muted/40 p-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span><strong>{completedTasksThisWeek}</strong> task completate questa settimana</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Progetti Recenti */}
          <div className="lg:col-span-2">
            <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-5">
                <h3 className="text-base font-semibold">Progetti Attivi</h3>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  Vedi tutti <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2.5">
                {recentProjects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completed = projectTasks.filter(t => t.status === 'done').length;
                  const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;
                  const client = clients.find(c => c.id === project.client_id);

                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 p-3 md:p-4 rounded-2xl bg-muted/40 cursor-pointer active:bg-muted/80 hover:bg-muted/60 transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card shadow-soft shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client?.company_name} {project.end_date ? `| ${formatDate(project.end_date)}` : ''}
                        </p>
                      </div>
                      <div className="w-20 md:w-28 space-y-1.5 shrink-0">
                        <div className="flex justify-between text-[10px] md:text-[11px]">
                          <span className="text-muted-foreground">{completed}/{projectTasks.length}</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-foreground/60"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {recentProjects.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Nessun progetto attivo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>
      </div>

      <IdeaQuickAdd
        open={ideaOpen}
        onOpenChange={setIdeaOpen}
        onSave={(idea) => {
          if (profile) {
            createIdea.mutate({ ...idea, author_id: profile.id, status: 'new', votes: 0 });
          }
        }}
      />
    </div>
  );
}
