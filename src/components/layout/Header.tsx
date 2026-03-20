import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, X, AlertTriangle, Clock, Info, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const notifRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  // Close on outside click
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
    <header className="sticky top-0 lg:top-0 z-20 flex h-14 md:h-16 items-center justify-between bg-background/80 backdrop-blur-xl px-4 md:px-6 border-b border-border/50">
      <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            className="w-64 pl-9 bg-card border-border rounded-xl focus:bg-card"
          />
        </div>

        {onQuickAdd && (
          <Button size="sm" onClick={onQuickAdd} className="rounded-xl gap-1.5 bg-foreground hover:bg-foreground/90 text-background">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{quickAddLabel || 'Nuovo'}</span>
          </Button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-5 w-5 text-foreground/60" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D05A5A] text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold">Notifiche</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" /> Segna tutte lette
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nessuna notifica
                  </div>
                ) : (
                  notifications.map(n => {
                    const Icon = typeIcons[n.type] || Info;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
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
    </header>
  );
}
