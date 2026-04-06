import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectUpdate } from '@/types';

export function useProjectUpdates(projectId?: string) {
  return useQuery<ProjectUpdate[]>({
    queryKey: ['project-updates', projectId],
    queryFn: async () => {
      if (!supabase || !projectId) return [];
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) {
        // Table may not exist yet (migration not run)
        console.warn('project_updates query error:', error.message);
        return [];
      }
      return (data ?? []) as ProjectUpdate[];
    },
    enabled: !!projectId,
  });
}

export function useCreateProjectUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (update: { project_id: string; user_id: string; content: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase.from('project_updates').insert(update).select().single();
      if (error) throw error;
      return data as ProjectUpdate;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['project-updates', data.project_id] });
    },
  });
}
