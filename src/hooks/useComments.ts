import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Comment, CommentEntityType } from '@/types';

export function useComments(entityType: CommentEntityType, entityId?: string) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: async () => {
      if (!supabase || !entityId) return [];
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as Comment[];
    },
    enabled: !!entityId,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (comment: { entity_type: CommentEntityType; entity_id: string; user_id: string; content: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase.from('comments').insert(comment).select().single();
      if (error) throw error;
      return data as Comment;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['comments', vars.entity_type, vars.entity_id] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, entityType, entityId }: { id: string; entityType: CommentEntityType; entityId: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
      return { entityType, entityId };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['comments', data.entityType, data.entityId] });
    },
  });
}
