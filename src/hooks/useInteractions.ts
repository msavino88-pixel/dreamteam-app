import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClientInteraction } from '@/types';

export function useInteractions(clientId?: string) {
  return useQuery<ClientInteraction[]>({
    queryKey: ['interactions', clientId],
    queryFn: async () => {
      if (!supabase) return [];
      let query = supabase.from('client_interactions').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query.order('interaction_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClientInteraction[];
    },
  });
}

export function useCreateInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (interaction: Partial<ClientInteraction>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('client_interactions')
        .insert(interaction)
        .select()
        .single();
      if (error) throw error;
      return data as ClientInteraction;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['interactions'] });
      qc.invalidateQueries({ queryKey: ['interactions', data.client_id] });
    },
  });
}
