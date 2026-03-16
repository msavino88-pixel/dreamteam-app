import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ActivityFeedItem } from '@/types';

export function useActivities(limit = 10) {
  return useQuery<ActivityFeedItem[]>({
    queryKey: ['activities', limit],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ActivityFeedItem[];
    },
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Partial<ActivityFeedItem>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('activity_feed')
        .insert(activity)
        .select()
        .single();
      if (error) throw error;
      return data as ActivityFeedItem;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
