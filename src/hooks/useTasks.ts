import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Task } from '@/types';

export function useTasks(projectId?: string) {
  return useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!supabase) return [];
      let query = supabase.from('tasks').select('*');
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query.order('position');
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useAllTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position');
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
}
