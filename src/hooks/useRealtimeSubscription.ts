import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const REALTIME_TABLES = [
  { table: 'clients', queryKey: 'clients' },
  { table: 'client_spending', queryKey: 'spending' },
  { table: 'client_interactions', queryKey: 'interactions' },
  { table: 'projects', queryKey: 'projects' },
  { table: 'tasks', queryKey: 'tasks' },
  { table: 'ideas', queryKey: 'ideas' },
  { table: 'activity_feed', queryKey: 'activities' },
  { table: 'users', queryKey: 'users' },
];

export function useRealtimeSubscription() {
  const qc = useQueryClient();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const match = REALTIME_TABLES.find(t => t.table === payload.table);
          if (match) {
            qc.invalidateQueries({ queryKey: [match.queryKey] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
