import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, X, AlertTriangle, Clock, Info, CheckCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlobalSearch } from './GlobalSearch';
import { useNotifications, type Notification } from '@/contexts/NotificationContext';

interface HeaderProps {
  title: string;
  onQuickAdd?: () => void;
  quickAddLabel?: string;
}

const typeIcons: Record<string, typeof AlertTriangle> = {
  overdue: AlertTriangle,
  deadline: Clock,
  warning: AlertTriangle,
  info: Info,
};

const typeColors: Record<string, string> = {
  overdue: 'text-destructive',
  deadline: 'text-amber-500',
  warning: 'text-amber-500',
  info: 'text-[#7B9BBF]',
};

export function Header({ title, onQuickAdd, quickAddLabel }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  const handleNotifClick = (n: Notification) => {
    markRead(n.id);
    if (n.link) {
      navigate(n.link);
      setNotifOpen(false);
    }
  };

  return (
    <header className="sticky top-14 lg:top-0 z-20 bg-background/90 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4">
      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl p-4 pt-20 md:hidden">
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="absolute top-5 right-4 p-2 rounded-2xl bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
          <GlobalSearch mobile onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h1>

        <div className="flex items-center gap-2">
          {/* Mobile search trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-2xl h-10 w-10"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Desktop search */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          {onQuickAdd && (
            <Button
              size="sm"
              onClick={onQuickAdd}
              className="gap-1.5 h-10 px-3 md:px-4"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{quickAddLabel || 'Nuovo'}</span>
            </Button>
          )}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-2xl h-10 w-10"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {notifOpen && (
              <div className="fixed inset-x-3 top-28 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-card rounded-[28px] shadow-float overflow-hidden z-50">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold">Notifiche</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-accent hover:underline flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" /> Segna lette
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="p-1.5 rounded-xl hover:bg-muted">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Nessuna notifica
                    </div>
                  ) : (
                    notifications.map(n => {
                      const Icon = typeIcons[n.type] || Info;
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-5 py-3.5 active:bg-muted/80 cursor-pointer transition-colors border-b border-border/30 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${typeColors[n.type]}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                          </div>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
