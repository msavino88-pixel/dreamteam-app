import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return (data ?? []) as User[];
    },
  });
}

export function useUser(id: string | undefined) {
  return useQuery<User | null>({
    queryKey: ['users', id],
    queryFn: async () => {
      if (!supabase || !id) return null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as User;
    },
    enabled: !!id,
  });
}
