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
    <div className={collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}>
      {/* Desktop sidebar — isolated fixed element */}
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      {/* Mobile sidebar — portal-like overlay */}
      <MobileSidebar open={mobileMenuOpen} onClose={closeMobile} />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 bg-background/90 backdrop-blur-xl border-b border-border/30">
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

      {/* Main content — margin handled by CSS classes, NOT inline styles */}
      <div className="app-main pt-14 lg:pt-0 pb-6 transition-[margin] duration-300">
        <Outlet />
      </div>
    </div>
  );
}
