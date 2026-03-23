import { NavLink, useNavigate } from 'react-router-dom';
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed, onToggleCollapse }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') || '?';

  const sidebarContent = (isMobile?: boolean) => {
    const isCollapsed = !isMobile && collapsed;
    const width = isCollapsed ? 'w-[72px]' : 'w-[260px]';

    return (
      <aside className={cn(
        "h-screen flex flex-col bg-card border-r border-border/50 transition-all duration-300",
        width
      )}>
        {/* Header */}
        <div className={cn("flex items-center py-6", isCollapsed ? "justify-center px-3" : "justify-between px-5")}>
          {isCollapsed ? (
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
          {isMobile && onMobileClose && (
            <button onClick={onMobileClose} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 flex flex-col gap-1 mt-1 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={onMobileClose}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-2xl text-sm font-medium transition-all duration-200',
                  isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]")} />
              {!isCollapsed && item.name}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && onToggleCollapse && (
          <div className={cn("px-3 pb-2", isCollapsed && "flex justify-center")}>
            <button
              onClick={onToggleCollapse}
              className={cn(
                "flex items-center gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                isCollapsed ? "p-2.5" : "px-3 py-2 w-full"
              )}
              title={isCollapsed ? 'Espandi' : 'Riduci'}
            >
              {isCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4" />
                  <span>Riduci</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* User */}
        <div className={cn("border-t border-border/50 py-4", isCollapsed ? "px-2" : "px-4")}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-primary text-sm font-semibold text-white">
                {initials}
              </div>
              <button
                onClick={async () => { await signOut(); navigate('/login'); }}
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
                onClick={async () => { await signOut(); navigate('/login'); }}
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
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block fixed left-0 top-0 z-40" style={{ pointerEvents: 'auto' }}>
        {sidebarContent(false)}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="fixed left-0 top-0 z-50">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
