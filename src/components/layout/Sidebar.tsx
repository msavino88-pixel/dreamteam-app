import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Lightbulb,
  UserCog,
  Settings,
  LogOut,
  ClipboardList,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Il Mio Lavoro', href: '/my-work', icon: ClipboardList },
  { name: 'Clienti', href: '/clients', icon: Users },
  { name: 'Progetti', href: '/projects', icon: FolderKanban },
  { name: 'Idee', href: '/ideas', icon: Lightbulb },
  { name: 'Team', href: '/team', icon: UserCog },
  { name: 'Impostazioni', href: '/settings', icon: Settings },
];

const roleLabels: Record<string, string> = { admin: 'Admin', manager: 'Manager', consultant: 'Consulente' };

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') || '?';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNav = (href: string) => {
    navigate(href);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-0 top-0 h-screen flex-col bg-card border-r border-border/50 transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center py-6", collapsed ? "justify-center px-3" : "justify-between px-5")}>
        {collapsed ? (
          <img src="/logo.png" alt="dreamteam" className="h-8 w-8" />
        ) : (
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="dreamteam" className="h-9 w-9" />
            <div>
              <span className="text-base font-light tracking-wide text-foreground">dream</span>
              <span className="text-base font-bold tracking-wide text-foreground">team</span>
              <p className="text-[8px] tracking-[0.2em] text-muted-foreground uppercase -mt-0.5">Management Finest</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 flex flex-col gap-1 mt-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => handleNav(item.href)}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center rounded-2xl text-sm font-medium transition-all duration-200 w-full text-left',
                collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3',
                active
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-[18px] w-[18px]")} />
              {!collapsed && item.name}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className={cn("px-3 pb-2", collapsed && "flex justify-center")}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "flex items-center gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            collapsed ? "p-2.5" : "px-3 py-2 w-full"
          )}
          title={collapsed ? 'Espandi' : 'Riduci'}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Riduci</span>
            </>
          )}
        </button>
      </div>

      {/* User */}
      <div className={cn("border-t border-border/50 py-4", collapsed ? "px-2" : "px-4")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-primary text-sm font-semibold text-white">
              {initials}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Esci"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-primary text-sm font-semibold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'Utente'}</p>
              <p className="text-[11px] text-muted-foreground">{roleLabels[profile?.role || 'consultant']}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Esci"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Mobile Sidebar (separate component, no shared state) ── */

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') || '?';

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNav = (href: string) => {
    navigate(href);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed left-0 top-0 z-50 h-screen w-[260px] flex flex-col bg-card border-r border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="dreamteam" className="h-9 w-9" />
            <div>
              <span className="text-base font-light tracking-wide text-foreground">dream</span>
              <span className="text-base font-bold tracking-wide text-foreground">team</span>
              <p className="text-[8px] tracking-[0.2em] text-muted-foreground uppercase -mt-0.5">Management Finest</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleNav(item.href)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 w-full text-left',
                  active
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border/50 py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-primary text-sm font-semibold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'Utente'}</p>
              <p className="text-[11px] text-muted-foreground">{roleLabels[profile?.role || 'consultant']}</p>
            </div>
            <button
              type="button"
              onClick={async () => { await signOut(); navigate('/login'); }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Esci"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
