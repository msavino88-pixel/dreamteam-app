import { useState, useCallback } from 'react';
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

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileMenuOpen(true), []);
  const closeMobile = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="app-grid min-h-screen bg-background">
      {/* Desktop sidebar — sticky in grid, NOT fixed */}
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      {/* Mobile sidebar — overlay */}
      <MobileSidebar open={mobileMenuOpen} onClose={closeMobile} />

      {/* Main column */}
      <div className="min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 h-14 flex items-center px-4 bg-background/90 backdrop-blur-xl border-b border-border/30">
          <button
            type="button"
            onClick={openMobile}
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

        {/* Page content */}
        <main className="pb-6 pb-safe">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
