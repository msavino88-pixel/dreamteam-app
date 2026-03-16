import { Header } from '@/components/layout/Header';
import { useUsers } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { Mail, Phone, FolderKanban, Users as UsersIcon } from 'lucide-react';

const roleLabels: Record<string, string> = { admin: 'Amministratore', manager: 'Manager', consultant: 'Consulente' };
const avatarGradients = [
  'from-[#D05A5A] to-[#D5C8B8]',
  'from-[#9B8EBD] to-[#7B9BBF]',
  'from-[#7A8B5E] to-[#BCC8B8]',
  'from-[#7B9BBF] to-[#9B8EBD]',
];

export default function Team() {
  const { data: users = [] } = useUsers();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();

  return (
    <div>
      <Header title="Team" />
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">{users.length} membri del team</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user, idx) => {
            const assignedClients = clients.filter(c => c.assigned_to === user.id).length;
            const activeProjects = projects.filter(p =>
              p.created_by === user.id && (p.status === 'active' || p.status === 'planning')
            ).length;

            return (
              <div key={user.id} className="rounded-2xl bg-[#1a1a1e] text-white p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} text-lg font-semibold text-white`}>
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.full_name}</h3>
                    <span className="text-xs text-white/40">{roleLabels[user.role]}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/40">
                    <Mail className="h-4 w-4" /> {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-white/40">
                      <Phone className="h-4 w-4" /> {user.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10 text-sm">
                  <div className="flex items-center gap-1.5 text-white/35">
                    <UsersIcon className="h-4 w-4" />
                    <span>{assignedClients} clienti</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/35">
                    <FolderKanban className="h-4 w-4" />
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
