import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Menu } from 'lucide-react';

const COLLAPSED_KEY = 'sidebar-collapsed';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === 'true'; }
    catch { return false; }
  });

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  };

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2.5 -ml-1 rounded-2xl hover:bg-muted active:scale-95 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <img src="/logo.png" alt="dreamteam" className="h-7 w-7" />
          <span className="text-sm font-light">dream</span>
          <span className="text-sm font-bold -ml-1">team</span>
        </div>
      </div>

      {/* Main content */}
      <main
        className="pt-14 lg:pt-0 pb-6 transition-[margin] duration-300"
        style={{ marginLeft: undefined }}
      >
        <style>{`@media(min-width:1024px){#app-main{margin-left:${sidebarWidth}px}}`}</style>
        <div id="app-main" className="transition-[margin] duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
