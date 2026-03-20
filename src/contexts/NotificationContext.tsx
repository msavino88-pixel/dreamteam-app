import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAllTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

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
  const { data: tasks = [] } = useAllTasks();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();

  // Generate notifications based on data
  useEffect(() => {
    const now = new Date();
    const generated: Notification[] = [];

    // Overdue tasks
    tasks.forEach(task => {
      if (task.status !== 'done' && task.due_date) {
        const due = new Date(task.due_date);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
          generated.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            title: 'Task scaduta',
            message: `"${task.title}" e scaduta da ${Math.abs(daysUntil)} giorni`,
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
    });

    // Projects ending soon
    projects.forEach(project => {
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
    });

    // Inactive clients warning
    clients.forEach(client => {
      if (client.status === 'active') {
        const lastUpdate = new Date(client.updated_at);
        const daysSince = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 60) {
          generated.push({
            id: `inactive-client-${client.id}`,
            type: 'info',
            title: 'Cliente inattivo',
            message: `${client.company_name}: nessuna attivita da ${daysSince} giorni`,
            read: false,
            created_at: now.toISOString(),
            link: `/clients/${client.id}`,
          });
        }
      }
    });

    // Preserve read state from previous notifications
    setNotifications(prev => {
      const readIds = new Set(prev.filter(n => n.read).map(n => n.id));
      return generated.map(n => ({ ...n, read: readIds.has(n.id) }));
    });
  }, [tasks, projects, clients]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismissNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
