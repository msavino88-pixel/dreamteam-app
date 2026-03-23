import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <button
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

      <main
        className="pt-14 lg:pt-0 pb-6 transition-[margin] duration-300"
        style={{ marginLeft: undefined }}
      >
        {/* Use CSS class for mobile, inline style for desktop responsive sidebar */}
        <div
          className="transition-[margin] duration-300"
          style={{
            // On desktop (lg+), apply sidebar margin. On mobile, 0.
            // We use a CSS media query approach via a wrapper
          }}
        >
          <style>{`
            @media (min-width: 1024px) {
              #main-content { margin-left: ${collapsed ? 72 : 260}px; }
            }
          `}</style>
          <div id="main-content" className="transition-[margin] duration-300">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
