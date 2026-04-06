import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types';

export function useMessages(userId?: string) {
  return useQuery<Message[]>({
    queryKey: ['messages', userId],
    queryFn: async () => {
      if (!supabase || !userId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`to_user_id.eq.${userId},from_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!userId,
  });
}

export function useUnreadCount(userId?: string) {
  return useQuery<number>({
    queryKey: ['messages', 'unread', userId],
    queryFn: async () => {
      if (!supabase || !userId) return 0;
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', userId)
        .eq('read', false);
      if (error) return 0;
      return count ?? 0;
    },
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: { from_user_id: string; to_user_id: string; subject?: string; content: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase.from('messages').insert(msg).select().single();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
