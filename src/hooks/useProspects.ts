import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Prospect } from '@/types';

export function useProspects() {
  return useQuery<Prospect[]>({
    queryKey: ['prospects'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('prospects query error:', error.message);
        return [];
      }
      return (data ?? []) as Prospect[];
    },
  });
}

export function useCreateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (prospect: Partial<Prospect>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase.from('prospects').insert(prospect).select().single();
      if (error) throw error;
      return data as Prospect;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}

export function useUpdateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Prospect> & { id: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase.from('prospects').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as Prospect;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}

export function useDeleteProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('prospects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prospects'] });
    },
  });
}
