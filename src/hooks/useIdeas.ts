import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Idea } from '@/types';

export function useIdeas() {
  return useQuery<Idea[]>({
    queryKey: ['ideas'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Idea[];
    },
  });
}

export function useCreateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (idea: Partial<Idea>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('ideas')
        .insert(idea)
        .select()
        .single();
      if (error) throw error;
      return data as Idea;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useVoteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ideaId: string) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data: current } = await supabase
        .from('ideas')
        .select('votes')
        .eq('id', ideaId)
        .single();
      const { data, error } = await supabase
        .from('ideas')
        .update({ votes: (current?.votes ?? 0) + 1 })
        .eq('id', ideaId)
        .select()
        .single();
      if (error) throw error;
      return data as Idea;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useUpdateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Idea> & { id: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Idea;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}
