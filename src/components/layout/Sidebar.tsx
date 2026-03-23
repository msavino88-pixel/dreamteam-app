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
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') || '?';

  const sidebarContent = (
    <aside className="h-screen w-[260px] text-white flex flex-col" style={{ background: 'var(--sidebar-bg)' }}>
      <div className="flex items-center justify-between px-6 py-7">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 32 32" className="h-8 w-8 text-[var(--accent-lime)]" fill="currentColor">
            <path d="M16 4c-2 0-4 2-5 5s-3 5-5 5c2 0 4 2 5 5s3 5 5 5c2 0 4-2 5-5s3-5 5-5c-2 0-4-2-5-5s-3-5-5-5z" opacity="0.9"/>
            <path d="M8 2c-1 0-2 1-2.5 2.5S4 7 3 7c1 0 2 1 2.5 2.5S7 12 8 12s2-1 2.5-2.5S12 7 13 7c-1 0-2-1-2.5-2.5S9 2 8 2z" opacity="0.4"/>
          </svg>
          <div>
            <span className="text-lg font-light tracking-wide">dream</span>
            <span className="text-lg font-bold tracking-wide">team</span>
            <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase -mt-0.5">Management School</p>
          </div>
        </div>
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 mt-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--accent-lime)] text-[#111111] shadow-glow'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/80'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-3">
        <div className="flex gap-1 mb-4">
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-management)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-marketing)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-finance)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-branding)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-hr)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--dt-ai)' }} />
        </div>
      </div>

      <div className="border-t border-white/8 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-lime)] text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">{profile?.full_name || 'Utente'}</p>
            <p className="text-[11px] text-white/35">{roleLabels[profile?.role || 'consultant']}</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="p-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
            title="Esci"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 z-40">
        {sidebarContent}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="fixed left-0 top-0 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
