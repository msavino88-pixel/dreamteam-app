import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useTasks';
import { useIdeas } from '@/hooks/useIdeas';
import { Search, Building2, FolderKanban, CheckCircle2, Lightbulb, X } from 'lucide-react';

interface SearchResult {
  type: 'client' | 'project' | 'task' | 'idea';
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

const typeIcons = {
  client: Building2,
  project: FolderKanban,
  task: CheckCircle2,
  idea: Lightbulb,
};

const typeLabels = {
  client: 'Cliente',
  project: 'Progetto',
  task: 'Task',
  idea: 'Idea',
};

const typeColors = {
  client: 'text-[#D5C8B8]',
  project: 'text-[#9B8EBD]',
  task: 'text-[#7B9BBF]',
  idea: 'text-[#D05A5A]',
};

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();
  const { data: ideas = [] } = useIdeas();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    clients.forEach(c => {
      if (c.company_name.toLowerCase().includes(q) || c.contact_name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) {
        results.push({ type: 'client', id: c.id, title: c.company_name, subtitle: c.contact_name, link: `/clients/${c.id}` });
      }
    });

    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
        results.push({ type: 'project', id: p.id, title: p.name, subtitle: p.description?.slice(0, 60) || '', link: `/projects/${p.id}` });
      }
    });

    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        results.push({ type: 'task', id: t.id, title: t.title, subtitle: t.description?.slice(0, 60) || '', link: `/projects/${t.project_id}` });
      }
    });

    ideas.forEach(i => {
      if (i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.tags.some(tag => tag.toLowerCase().includes(q))) {
        results.push({ type: 'idea', id: i.id, title: i.title, subtitle: i.tags.join(', '), link: '/ideas' });
      }
    });

    return results.slice(0, 12);
  }, [query, clients, projects, tasks, ideas]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.link);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative hidden md:block" ref={ref}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        placeholder="Cerca... (Ctrl+K)"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        className="w-64 lg:w-80 pl-9 pr-8 bg-card border-border rounded-xl focus:bg-card"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); setOpen(false); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
          {results.map((r, idx) => {
            const Icon = typeIcons[r.type];
            return (
              <div
                key={`${r.type}-${r.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
                onClick={() => handleSelect(r)}
              >
                <Icon className={`h-4 w-4 shrink-0 ${typeColors[r.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">
                  {typeLabels[r.type]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50 p-6 text-center">
          <p className="text-sm text-muted-foreground">Nessun risultato per "{query}"</p>
        </div>
      )}
    </div>
  );
}
