import { Header } from '@/components/layout/Header';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { departmentLabels, departmentColors, departmentBadgeClasses } from '@/lib/formatting';
import { Mail, Phone, FolderKanban, Users as UsersIcon } from 'lucide-react';

const roleLabels: Record<string, string> = { admin: 'Amministratore', manager: 'Manager', consultant: 'Consulente' };

export default function Team() {
  const { data: users = [] } = useUsers();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();

  return (
    <div>
      <Header title="Team" />
      <div className="px-4 md:px-6 space-y-4">
        <p className="text-label text-muted-foreground uppercase">{users.length} membri del team</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {users.map((user) => {
            const dept = user.department;
            const deptColor = dept ? departmentColors[dept] : undefined;
            const assignedClients = clients.filter(c => c.assigned_to === user.id).length;
            const activeProjects = projects.filter(p =>
              p.created_by === user.id && (p.status === 'active' || p.status === 'planning')
            ).length;

            return (
              <div key={user.id} className="rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-6 relative overflow-hidden">

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white shrink-0"
                    style={{
                      background: deptColor
                        ? `linear-gradient(135deg, ${deptColor}, ${deptColor}cc)`
                        : 'linear-gradient(135deg, #9B8EBD, #7B9BBF)'
                    }}
                  >
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{user.full_name}</h3>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-xs text-muted-foreground">{roleLabels[user.role]}</span>
                      {dept && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${departmentBadgeClasses[dept]}`}>
                          {departmentLabels[dept]}
                        </span>
                      )}
                    </div>
                  </div>
                  {!user.is_active && (
                    <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Disattivato</span>
                  )}
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {user.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <UsersIcon className="h-3.5 w-3.5" />
                    <span>{assignedClients} clienti</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span>{activeProjects} progetti</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
