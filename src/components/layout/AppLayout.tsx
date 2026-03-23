import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Mobile top bar - compact, touch friendly */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 bg-background/90 backdrop-blur-xl">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2.5 -ml-1 rounded-2xl hover:bg-muted active:scale-95 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <svg viewBox="0 0 32 32" className="h-5 w-5 text-foreground" fill="currentColor">
            <path d="M16 4c-2 0-4 2-5 5s-3 5-5 5c2 0 4 2 5 5s3 5 5 5c2 0 4-2 5-5s3-5 5-5c-2 0-4-2-5-5s-3-5-5-5z" opacity="0.9"/>
          </svg>
          <span className="text-sm font-light">dream</span>
          <span className="text-sm font-bold -ml-1">team</span>
        </div>
      </div>

      <main className="lg:ml-[260px] pt-14 lg:pt-0 pb-6">
        <Outlet />
      </main>
    </div>
  );
}
