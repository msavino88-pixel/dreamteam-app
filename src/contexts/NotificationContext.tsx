import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAllTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

export interface Notification {
  id: string;
  type: 'deadline' | 'overdue' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevIdsRef = useRef('');
  const { data: tasks } = useAllTasks();
  const { data: projects } = useProjects();

  // Generate notifications — only when data IDs actually change
  useEffect(() => {
    if (!tasks || !projects) return;

    const now = new Date();
    const generated: Notification[] = [];

    // Overdue tasks
    for (const task of tasks) {
      if (task.status !== 'done' && task.due_date) {
        const due = new Date(task.due_date);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
          generated.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            title: 'Task scaduta',
            message: `"${task.title}" è scaduta da ${Math.abs(daysUntil)} giorni`,
            read: false,
            created_at: now.toISOString(),
            link: task.project_id ? `/projects/${task.project_id}` : undefined,
          });
        } else if (daysUntil <= 3) {
          generated.push({
            id: `deadline-${task.id}`,
            type: 'deadline',
            title: 'Scadenza vicina',
            message: `"${task.title}" scade ${daysUntil === 0 ? 'oggi' : `tra ${daysUntil} giorn${daysUntil === 1 ? 'o' : 'i'}`}`,
            read: false,
            created_at: now.toISOString(),
            link: task.project_id ? `/projects/${task.project_id}` : undefined,
          });
        }
      }
    }

    // Projects ending soon
    for (const project of projects) {
      if (project.status === 'active' && project.end_date) {
        const end = new Date(project.end_date);
        const daysUntil = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
          generated.push({
            id: `project-end-${project.id}`,
            type: 'warning',
            title: 'Progetto in scadenza',
            message: `"${project.name}" termina ${daysUntil === 0 ? 'oggi' : `tra ${daysUntil} giorni`}`,
            read: false,
            created_at: now.toISOString(),
            link: `/projects/${project.id}`,
          });
        }
      }
    }

    // Only update state if notification IDs changed
    const newIds = generated.map(n => n.id).sort().join(',');
    if (newIds !== prevIdsRef.current) {
      prevIdsRef.current = newIds;
      setNotifications(prev => {
        const readIds = new Set(prev.filter(n => n.read).map(n => n.id));
        return generated.map(n => ({ ...n, read: readIds.has(n.id) }));
      });
    }
  }, [tasks, projects]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = useMemo(() => ({
    notifications, unreadCount, markRead, markAllRead, dismissNotification
  }), [notifications, unreadCount, markRead, markAllRead, dismissNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
