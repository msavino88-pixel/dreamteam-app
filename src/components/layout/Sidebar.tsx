import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Lightbulb,
  UserCog,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clienti', href: '/clients', icon: Users },
  { name: 'Progetti', href: '/projects', icon: FolderKanban },
  { name: 'Idee', href: '/ideas', icon: Lightbulb },
  { name: 'Team', href: '/team', icon: UserCog },
  { name: 'Impostazioni', href: '/settings', icon: Settings },
];

const roleLabels: Record<string, string> = { admin: 'Admin', manager: 'Manager', consultant: 'Consulente' };

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#1a1a1e] text-white flex flex-col">
      {/* Logo dreamteam */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <svg viewBox="0 0 32 32" className="h-8 w-8 text-white" fill="currentColor">
          <path d="M16 4c-2 0-4 2-5 5s-3 5-5 5c2 0 4 2 5 5s3 5 5 5c2 0 4-2 5-5s3-5 5-5c-2 0-4-2-5-5s-3-5-5-5z" opacity="0.9"/>
          <path d="M8 2c-1 0-2 1-2.5 2.5S4 7 3 7c1 0 2 1 2.5 2.5S7 12 8 12s2-1 2.5-2.5S12 7 13 7c-1 0-2-1-2.5-2.5S9 2 8 2z" opacity="0.5"/>
        </svg>
        <div>
          <span className="text-lg font-light tracking-wide">dream</span>
          <span className="text-lg font-bold tracking-wide">team</span>
          <p className="text-[9px] tracking-[0.2em] text-white/40 uppercase -mt-0.5">Management School</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 mt-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Barra colori sezioni */}
      <div className="px-4 pb-3">
        <div className="flex gap-1.5 mb-4">
          <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--dt-management)' }} title="Management" />
          <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--dt-marketing)' }} title="Marketing" />
          <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--dt-finance)' }} title="Finance" />
          <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--dt-branding)' }} title="Branding" />
          <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--dt-hr)' }} title="HR" />
          <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--dt-ai)' }} title="AI" />
        </div>
      </div>

      {/* User */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#9B8EBD] to-[#7B9BBF] text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">{profile?.full_name || 'Utente'}</p>
            <p className="text-[11px] text-white/40">{roleLabels[profile?.role || 'consultant']}</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
            title="Esci"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
