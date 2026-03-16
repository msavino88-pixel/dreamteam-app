import type { Idea, User, Client, Project } from '@/types';
import { statusLabels, formatRelativeDate } from '@/lib/formatting';
import { ThumbsUp, Lightbulb, Link } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onVote?: (ideaId: string) => void;
  users?: User[];
  clients?: Client[];
  projects?: Project[];
}

const ideaStatusColors: Record<string, string> = {
  new: 'bg-[#7B9BBF]',
  evaluating: 'bg-[#D5C8B8]',
  approved: 'bg-[#7A8B5E]',
  rejected: 'bg-[#D05A5A]',
  implemented: 'bg-emerald-400',
};

export function IdeaCard({ idea, onVote, users = [], clients = [], projects = [] }: IdeaCardProps) {
  const author = users.find(u => u.id === idea.author_id);
  const client = idea.client_id ? clients.find(c => c.id === idea.client_id) : null;
  const project = idea.project_id ? projects.find(p => p.id === idea.project_id) : null;

  return (
    <div className="rounded-2xl bg-[#1a1a1e] text-white p-5 hover:bg-[#222226] transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-[#D5C8B8]/20 p-2">
            <Lightbulb className="h-4 w-4 text-[#D5C8B8]" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${ideaStatusColors[idea.status]}`} />
            <span className="text-[11px] text-white/40">{statusLabels[idea.status]}</span>
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onVote?.(idea.id); }}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span className="text-sm font-semibold">{idea.votes}</span>
        </button>
      </div>

      <h3 className="font-semibold text-sm text-white mb-1">{idea.title}</h3>
      {idea.description && (
        <p className="text-xs text-white/35 mb-3 line-clamp-3">{idea.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {idea.tags.map(tag => (
          <span key={tag} className="rounded-full bg-white/8 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/45">
            {tag}
          </span>
        ))}
      </div>

      {(client || project) && (
        <div className="flex items-center gap-2 text-xs text-white/30 mb-3">
          <Link className="h-3 w-3" />
          {client && <span>{client.company_name}</span>}
          {client && project && <span>/</span>}
          {project && <span>{project.name}</span>}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-white/30 border-t border-white/10 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#9B8EBD] to-[#7B9BBF] flex items-center justify-center text-[8px] font-bold text-white">
            {author?.full_name.split(' ').map(n => n[0]).join('') || '?'}
          </div>
          {author?.full_name}
        </div>
        <span>{formatRelativeDate(idea.created_at)}</span>
      </div>
    </div>
  );
}
