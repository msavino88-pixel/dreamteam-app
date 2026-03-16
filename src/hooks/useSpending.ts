import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClientSpending } from '@/types';

export function useSpending(clientId?: string) {
  return useQuery<ClientSpending[]>({
    queryKey: ['spending', clientId],
    queryFn: async () => {
      if (!supabase) return [];
      let query = supabase.from('client_spending').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientSpending[];
    },
  });
}

export function useAllSpending() {
  return useQuery<ClientSpending[]>({
    queryKey: ['spending', 'all'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('client_spending')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientSpending[];
    },
  });
}

export function useCreateSpending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (spending: Partial<ClientSpending>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('client_spending')
        .insert(spending)
        .select()
        .single();
      if (error) throw error;
      return data as ClientSpending;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['spending'] });
      qc.invalidateQueries({ queryKey: ['spending', data.client_id] });
    },
  });
}
