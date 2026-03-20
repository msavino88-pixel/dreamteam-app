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
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
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
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [ideaOpen, setIdeaOpen] = useState(false);
  const { profile } = useAuth();
  useRealtimeSubscription();

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

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-4 md:p-6 space-y-6">
        {/* KPI con accenti colore sezioni dreamteam */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Clienti Attivi"
            value={activeClients}
            icon={Users}
            trend={{ value: 12, label: 'vs mese scorso' }}
            accentColor="var(--dt-management)"
          />
          <StatCard
            title="Progetti in Corso"
            value={activeProjects}
            icon={FolderKanban}
            accentColor="var(--dt-branding)"
          />
          <StatCard
            title="Fatturato Totale"
            value={formatCurrency(totalRevenue)}
            icon={Euro}
            trend={{ value: 8, label: 'vs trimestre scorso' }}
            accentColor="var(--dt-finance)"
          />
          <StatCard
            title="Task Scadute"
            value={overdueTasks}
            icon={AlertTriangle}
            accentColor="var(--dt-marketing)"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button onClick={() => navigate('/clients/new')} className="gap-2 rounded-xl bg-foreground hover:bg-foreground/90 text-background">
            <Plus className="h-4 w-4" /> Nuovo Cliente
          </Button>
          <Button variant="outline" onClick={() => navigate('/projects/new')} className="gap-2 rounded-xl border-foreground/15 hover:bg-white/60">
            <Plus className="h-4 w-4" /> Nuovo Progetto
          </Button>
          <Button variant="outline" onClick={() => setIdeaOpen(true)} className="gap-2 rounded-xl border-foreground/15 hover:bg-white/60">
            <Lightbulb className="h-4 w-4" /> Nuova Idea
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progetti Recenti - dark card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border p-4 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-card-foreground">Progetti Attivi</h3>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-xs text-muted-foreground hover:text-card-foreground/70 flex items-center gap-1 transition-colors"
                >
                  Vedi tutti <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-3">
                {recentProjects.map(project => {
                  const projectTasks = tasks.filter(t => t.project_id === project.id);
                  const completed = projectTasks.filter(t => t.status === 'done').length;
                  const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;
                  const client = clients.find(c => c.id === project.client_id);

                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {client?.company_name} | {formatDate(project.end_date)}
                        </p>
                      </div>
                      <div className="w-28 space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">{completed}/{projectTasks.length}</span>
                          <span className="font-medium text-card-foreground/70">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                              background: 'var(--dt-branding)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
