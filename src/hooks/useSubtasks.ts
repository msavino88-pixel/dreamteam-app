import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Subtask } from '@/types';

export function useSubtasks(taskId?: string) {
  return useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      if (!supabase || !taskId) return [];
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data || []) as Subtask[];
    },
    enabled: !!taskId,
  });
}

export function useAllSubtasks(taskIds: string[]) {
  return useQuery({
    queryKey: ['subtasks', 'batch', taskIds.sort().join(',')],
    queryFn: async () => {
      if (!supabase || taskIds.length === 0) return [];
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .in('task_id', taskIds)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data || []) as Subtask[];
    },
    enabled: taskIds.length > 0,
  });
}

export function useCreateSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subtask: { task_id: string; title: string; position?: number }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase.from('subtasks').insert(subtask).select().single();
      if (error) throw error;
      return data as Subtask;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['subtasks', vars.task_id] });
      qc.invalidateQueries({ queryKey: ['subtasks', 'batch'] });
    },
  });
}

export function useToggleSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed, taskId }: { id: string; completed: boolean; taskId: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('subtasks').update({ completed }).eq('id', id);
      if (error) throw error;
      return { taskId };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['subtasks', data.taskId] });
      qc.invalidateQueries({ queryKey: ['subtasks', 'batch'] });
    },
  });
}

export function useDeleteSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('subtasks').delete().eq('id', id);
      if (error) throw error;
      return { taskId };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['subtasks', data.taskId] });
      qc.invalidateQueries({ queryKey: ['subtasks', 'batch'] });
    },
  });
}
