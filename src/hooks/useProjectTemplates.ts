import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProjectTemplate } from '@/types';

export function useProjectTemplates() {
  return useQuery<ProjectTemplate[]>({
    queryKey: ['project_templates'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data ?? []) as ProjectTemplate[];
    },
  });
}

export function useCreateProjectTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (template: Partial<ProjectTemplate>) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('project_templates')
        .insert(template)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_templates'] });
    },
  });
}

export function useUpdateProjectTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectTemplate> & { id: string }) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { data, error } = await supabase
        .from('project_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectTemplate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_templates'] });
    },
  });
}

export function useDeleteProjectTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase non configurato');
      const { error } = await supabase.from('project_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project_templates'] });
    },
  });
}
