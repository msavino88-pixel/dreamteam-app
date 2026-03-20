import { useActivities } from '@/hooks/useActivities';
import { useUsers } from '@/hooks/useUsers';
import { formatRelativeDate } from '@/lib/formatting';
import { Activity } from 'lucide-react';

const avatarColors = [
  'from-[#D5C8B8] to-[#BCC8B8]',
  'from-[#9B8EBD] to-[#7B9BBF]',
  'from-[#D05A5A] to-[#D5C8B8]',
  'from-[#7A8B5E] to-[#BCC8B8]',
];

export function ActivityFeed() {
  const { data: allActivities = [] } = useActivities(10);
  const { data: users = [] } = useUsers();
  const activities = allActivities.slice(0, 10);

  return (
    <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border p-6">
      <h3 className="text-base font-semibold text-card-foreground flex items-center gap-2 mb-5">
        <Activity className="h-4 w-4 text-muted-foreground" />
        Attività Recenti
      </h3>
      <div className="space-y-4">
        {activities.map((activity, idx) => {
          const user = users.find(u => u.id === activity.user_id);
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} text-[10px] font-bold text-white`}>
                {user?.full_name.split(' ').map(n => n[0]).join('') || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-card-foreground/80">{activity.description}</p>
                <p className="text-[11px] text-muted-foreground">{formatRelativeDate(activity.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
