import { useActivities } from '@/hooks/useActivities';
import { useUsers } from '@/hooks/useUsers';
import { formatRelativeDate } from '@/lib/formatting';
import { Activity } from 'lucide-react';

const avatarColors = [
  'from-[#D5C8B8] to-[#BCC8B8]',
  'from-gray-400 to-gray-500',
  'from-[#D05A5A] to-[#D5C8B8]',
  'from-[#7A8B5E] to-[#BCC8B8]',
];

export function ActivityFeed() {
  const { data: allActivities = [] } = useActivities(10);
  const { data: users = [] } = useUsers();
  const activities = allActivities.slice(0, 10);

  return (
    <div className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-4 md:p-6">
      <h3 className="text-base font-semibold flex items-center gap-2 mb-4 md:mb-5">
        <Activity className="h-4 w-4 text-muted-foreground" />
        Attività Recenti
      </h3>
      <div className="space-y-3 md:space-y-4">
        {activities.map((activity, idx) => {
          const user = users.find(u => u.id === activity.user_id);
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} text-[10px] font-bold text-white`}>
                {user?.full_name.split(' ').map(n => n[0]).join('') || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeDate(activity.created_at)}</p>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">Nessuna attività recente</p>
        )}
      </div>
    </div>
  );
}
