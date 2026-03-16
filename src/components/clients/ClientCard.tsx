import { useNavigate } from 'react-router-dom';
import type { Client, ClientSpending, ClientInteraction, User } from '@/types';
import { statusLabels, formatCurrency, daysSince } from '@/lib/formatting';
import { Building2, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  spending?: ClientSpending[];
  interactions?: ClientInteraction[];
  users?: User[];
}

const statusDotColors: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-gray-400',
  lead: 'bg-[#7B9BBF]',
  churned: 'bg-[#D05A5A]',
};

export function ClientCard({ client, spending = [], interactions = [], users = [] }: ClientCardProps) {
  const navigate = useNavigate();
  const clientSpending = spending.filter(s => s.client_id === client.id);
  const totalSpent = clientSpending.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.amount, 0);
  const lastInteraction = interactions
    .filter(i => i.client_id === client.id)
    .sort((a, b) => new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime())[0];
  const daysSinceContact = lastInteraction ? daysSince(lastInteraction.interaction_date) : null;
  const assignee = users.find(u => u.id === client.assigned_to);

  return (
    <div
      className="rounded-2xl bg-[#1a1a1e] text-white p-5 cursor-pointer hover:bg-[#222226] transition-all duration-200 hover:scale-[1.01]"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Building2 className="h-5 w-5 text-white/60" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">{client.company_name}</h3>
            <p className="text-xs text-white/40">{client.contact_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${statusDotColors[client.status]}`} />
          <span className="text-[11px] text-white/50">{statusLabels[client.status]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-white/35 mb-4">
        {client.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span>{client.phone}</span>
          </div>
        )}
        {client.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>{client.city}</span>
          </div>
        )}
        {client.industry && (
          <div className="flex items-center gap-1.5">
            <span className="truncate">{client.industry}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div>
          <p className="text-[11px] text-white/30">Totale speso</p>
          <p className="text-sm font-bold text-white">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/30">Ultimo contatto</p>
          {daysSinceContact !== null ? (
            <p className={`text-sm font-semibold ${daysSinceContact > 60 ? 'text-[#D05A5A]' : daysSinceContact > 30 ? 'text-[#D5C8B8]' : 'text-emerald-400'}`}>
              {daysSinceContact > 60 && <AlertTriangle className="inline h-3 w-3 mr-1" />}
              {daysSinceContact}gg
            </p>
          ) : (
            <p className="text-sm text-white/20">-</p>
          )}
        </div>
      </div>

      {assignee && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/30">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#9B8EBD] to-[#7B9BBF] flex items-center justify-center text-[8px] font-bold text-white">
            {assignee.full_name.split(' ').map(n => n[0]).join('')}
          </div>
          {assignee.full_name}
        </div>
      )}
    </div>
  );
}
