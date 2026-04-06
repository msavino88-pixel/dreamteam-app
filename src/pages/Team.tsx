import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUsers, useAllUsers, useUpdateUser, useDeactivateUser, useReactivateUser } from '@/hooks/useUsers';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { departmentLabels, departmentColors, departmentBadgeClasses, departmentOptions } from '@/lib/formatting';
import type { User as UserType, UserRole } from '@/types';
import {
  Mail, Phone, FolderKanban, Users as UsersIcon,
  UserPlus, Pencil, Trash2, RotateCcw, Save, CheckCircle2,
  Crown, Briefcase, User
} from 'lucide-react';

const roleLabels: Record<string, string> = { admin: 'Amministratore', manager: 'Manager', consultant: 'Consulente' };
const roleOptions = [
  { value: 'consultant', label: 'Consulente' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Amministratore' },
];

export default function Team() {
  const { data: users = [] } = useUsers();
  const { data: allUsers = [] } = useAllUsers();
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const { profile } = useAuth();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();

  const isAdmin = profile?.role === 'admin';
  const displayUsers = isAdmin ? allUsers : users;

  // Invite form state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('consultant');
  const [inviteDept, setInviteDept] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  // Edit modal state
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('consultant');
  const [editDept, setEditDept] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editMsg, setEditMsg] = useState('');

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const openEditModal = (u: UserType) => {
    setEditingUser(u);
    setEditName(u.full_name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDept(u.department || '');
    setEditPassword('');
    setEditMsg('');
  };

  const handleSaveUser = async () => {
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        full_name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        department: editDept || null,
      });
      // Password change not supported from client-side (needs service role)
      if (editPassword.trim()) {
        setEditMsg('Profilo salvato! Nota: il cambio password non è disponibile dal pannello admin.');
        setTimeout(() => { setEditingUser(null); setEditMsg(''); }, 2500);
        return;
      }
      setEditMsg('Salvato!');
      setTimeout(() => { setEditingUser(null); setEditMsg(''); }, 800);
    } catch (err: unknown) {
      setEditMsg(`Errore: ${err instanceof Error ? err.message : 'sconosciuto'}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deactivateUser.mutateAsync(userId);
    } catch (err) {
      console.error('Deactivate error:', err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return;
    setInviting(true);
    setInviteMsg('');
    try {
      const tempPassword = `dt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const { data, error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: tempPassword,
        options: { data: { full_name: inviteName } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
          ...(inviteDept ? { department: inviteDept } : {}),
        });
      }
      setInviteMsg(`Membro "${inviteName}" creato! Credenziali: ${inviteEmail} / ${tempPassword}`);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('consultant');
      setInviteDept('');
    } catch (err: unknown) {
      setInviteMsg(`Errore: ${err instanceof Error ? err.message : 'sconosciuto'}`);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div>
      <Header
        title="Team"
        onQuickAdd={isAdmin ? () => setInviteOpen(true) : undefined}
        quickAddLabel="Aggiungi Membro"
      />
      <div className="px-4 md:px-6 space-y-4">
        <p className="text-label text-muted-foreground uppercase">
          {displayUsers.filter(u => u.is_active).length} membri attivi
          {isAdmin && allUsers.some(u => !u.is_active) && (
            <span> · {allUsers.filter(u => !u.is_active).length} disattivati</span>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {displayUsers.map((user) => {
            const dept = user.department;
            const deptColor = dept ? departmentColors[dept] : undefined;
            const assignedClients = clients.filter(c => c.assigned_to === user.id).length;
            const activeProjects = projects.filter(p =>
              p.created_by === user.id && (p.status === 'active' || p.status === 'planning')
            ).length;
            const isMe = user.id === profile?.id;
            const RoleIcon = user.role === 'admin' ? Crown : user.role === 'manager' ? Briefcase : User;

            return (
              <div
                key={user.id}
                className={`rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-6 relative overflow-hidden ${!user.is_active ? 'opacity-50' : ''}`}
              >
                {/* Admin actions */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title="Modifica"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {!isMe && (
                      user.is_active ? (
                        confirmDelete === user.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 text-[10px] h-6 px-2"
                              onClick={() => { deactivateUser.mutate(user.id); setConfirmDelete(null); }}
                            >
                              Conferma
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[10px] h-6 px-2"
                              onClick={() => setConfirmDelete(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(user.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Disattiva"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => reactivateUser.mutate(user.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Riattiva"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white shrink-0"
                    style={{
                      background: deptColor
                        ? `linear-gradient(135deg, ${deptColor}, ${deptColor}cc)`
                        : 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                    }}
                  >
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{user.full_name}</h3>
                      {isMe && (
                        <span className="text-[10px] bg-foreground/10 text-foreground px-1.5 py-0.5 rounded-full font-medium">Tu</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <RoleIcon className="h-3 w-3 text-muted-foreground" />
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

      {/* Invite Member Dialog */}
      {inviteOpen && (
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent onClose={() => setInviteOpen(false)} className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome Completo *</label>
                <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Mario Rossi" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email *</label>
                <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="mario@dreamteam.it" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ruolo</label>
                  <Select options={roleOptions} value={inviteRole} onChange={e => setInviteRole(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Area</label>
                  <Select options={departmentOptions} value={inviteDept} onChange={e => setInviteDept(e.target.value)} />
                </div>
              </div>
              {inviteMsg && (
                <div className={`p-3 rounded-xl text-sm ${inviteMsg.startsWith('Errore') ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>
                  {!inviteMsg.startsWith('Errore') && <CheckCircle2 className="inline h-4 w-4 mr-1" />}
                  {inviteMsg}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={inviting} className="flex-1 gap-2">
                  <UserPlus className="h-4 w-4" />
                  {inviting ? 'Creazione...' : 'Crea Account'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Annulla</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
          <DialogContent onClose={() => setEditingUser(null)} className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifica Membro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background: editingUser.department && departmentColors[editingUser.department]
                      ? `linear-gradient(135deg, ${departmentColors[editingUser.department]}, ${departmentColors[editingUser.department]}cc)`
                      : 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                  }}
                >
                  {editName.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{editingUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">Registrato il {new Date(editingUser.created_at).toLocaleDateString('it-IT')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome Completo</label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome e Cognome" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="email@dreamteam.it" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ruolo</label>
                  <Select options={roleOptions} value={editRole} onChange={e => setEditRole(e.target.value as UserRole)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Area</label>
                  <Select options={departmentOptions} value={editDept} onChange={e => setEditDept(e.target.value)} />
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nuova Password</label>
                  <Input
                    type="text"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Lascia vuoto per non cambiare"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Inserisci solo se vuoi reimpostare la password</p>
                </div>
              )}

              {editMsg && (
                <div className={`p-2.5 rounded-xl text-sm ${editMsg.startsWith('Errore') ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>
                  {!editMsg.startsWith('Errore') && <CheckCircle2 className="inline h-4 w-4 mr-1" />}
                  {editMsg}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveUser} disabled={updateUser.isPending || !editName.trim() || !editEmail.trim()} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  {updateUser.isPending ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
                <Button variant="outline" onClick={() => setEditingUser(null)}>Annulla</Button>
              </div>
              {isAdmin && editingUser?.id !== profile?.id && (
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 mt-2 gap-2"
                  onClick={() => {
                    if (window.confirm(`Disattivare "${editingUser?.full_name}"? L'account non potrà più accedere.`)) {
                      handleDeleteUser(editingUser!.id);
                      setEditingUser(null);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Disattiva Account
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
