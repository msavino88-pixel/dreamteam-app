import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useAllTasks } from '@/hooks/useTasks';
import { useIdeas } from '@/hooks/useIdeas';
import { useAllSpending } from '@/hooks/useSpending';
import { useInteractions } from '@/hooks/useInteractions';
import { useUsers, useAllUsers, useUpdateUser, useUpdateUserRole, useDeactivateUser, useReactivateUser } from '@/hooks/useUsers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { User as UserType, UserRole, Department } from '@/types';
import { departmentOptions, departmentBadgeClasses, departmentColors } from '@/lib/formatting';
import {
  Database, Wifi, WifiOff, Moon, Sun, Download,
  UserPlus, Shield, Mail, CheckCircle2, Users, Trash2,
  RotateCcw, Crown, Briefcase, User, Pencil, Save, X
} from 'lucide-react';

const roleOptions = [
  { value: 'consultant', label: 'Consulente' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Amministratore' },
];

export default function Settings() {
  const connected = isSupabaseConfigured();
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAdmin = profile?.role === 'admin';

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('consultant');
  const [inviteDept, setInviteDept] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();
  const { data: ideas = [] } = useIdeas();
  const { data: spending = [] } = useAllSpending();
  const { data: interactions = [] } = useInteractions();
  const { data: users = [] } = useUsers();
  const { data: allUsers = [] } = useAllUsers();
  const updateUser = useUpdateUser();
  const updateRole = useUpdateUserRole();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('consultant');
  const [editDept, setEditDept] = useState('');
  const [editMsg, setEditMsg] = useState('');

  const openEditModal = (u: UserType) => {
    setEditingUser(u);
    setEditName(u.full_name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDept(u.department || '');
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
      setEditMsg('Salvato!');
      setTimeout(() => { setEditingUser(null); setEditMsg(''); }, 800);
    } catch (err: unknown) {
      setEditMsg(`Errore: ${err instanceof Error ? err.message : 'sconosciuto'}`);
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
      setInviteEmail('');
      setInviteName('');
      setInviteRole('consultant');
      setInviteDept('');
    } catch (err: unknown) {
      setInviteMsg(`Errore: ${err instanceof Error ? err.message : 'sconosciuto'}`);
    } finally {
      setInviting(false);
    }
  };

  const handleBackup = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      exported_by: profile?.full_name,
      data: { users, clients, projects, tasks, ideas, spending, interactions },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamteam-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Header title="Impostazioni" />
      <div className="p-4 md:p-6 space-y-6 max-w-2xl">
        {/* Dark Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Aspetto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modalita {theme === 'dark' ? 'Scura' : 'Chiara'}</p>
                <p className="text-xs text-muted-foreground">Attiva/disattiva il tema scuro</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Invite Members (Admin only) */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invita Membro
              </CardTitle>
              <CardDescription>Aggiungi nuovi membri al tuo team con ruoli specifici</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome Completo</label>
                    <Input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Mario Rossi" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="mario@dreamteam.it" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ruolo</label>
                    <Select options={roleOptions} value={inviteRole} onChange={e => setInviteRole(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Area</label>
                    <Select options={departmentOptions} value={inviteDept} onChange={e => setInviteDept(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={inviting} className="gap-2 w-full sm:w-auto">
                  <Mail className="h-4 w-4" />
                  {inviting ? 'Creazione...' : 'Crea Account'}
                </Button>
                {inviteMsg && (
                  <div className={`p-3 rounded-xl text-sm ${inviteMsg.startsWith('Errore') ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>
                    {!inviteMsg.startsWith('Errore') && <CheckCircle2 className="inline h-4 w-4 mr-1" />}
                    {inviteMsg}
                  </div>
                )}
              </form>
              <div className="mt-4 p-3 rounded-xl bg-muted text-sm space-y-1">
                <p className="font-medium flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Livelli di accesso:</p>
                <p className="text-muted-foreground"><strong>Admin</strong> — Accesso completo, gestione team, impostazioni</p>
                <p className="text-muted-foreground"><strong>Manager</strong> — Gestione clienti, progetti, assegnazione task</p>
                <p className="text-muted-foreground"><strong>Consulente</strong> — Vede i propri progetti e task assegnate</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manage Members (Admin only) */}
        {isAdmin && allUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestione Membri
              </CardTitle>
              <CardDescription>
                {allUsers.filter(u => u.is_active).length} attivi, {allUsers.filter(u => !u.is_active).length} disattivati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {allUsers.map(u => {
                  const isMe = u.id === profile?.id;
                  const RoleIcon = u.role === 'admin' ? Crown : u.role === 'manager' ? Briefcase : User;
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        u.is_active
                          ? 'border-border bg-card'
                          : 'border-border/50 bg-muted/30 opacity-60'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{
                          background: u.department && departmentColors[u.department]
                            ? `linear-gradient(135deg, ${departmentColors[u.department]}, ${departmentColors[u.department]}cc)`
                            : 'linear-gradient(135deg, #9B8EBD, #7B9BBF)'
                        }}
                      >
                        {u.full_name.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{u.full_name}</p>
                          {isMe && (
                            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-medium">Tu</span>
                          )}
                          {!u.is_active && (
                            <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">Disattivato</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          {u.department && departmentBadgeClasses[u.department] && (
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border whitespace-nowrap ${departmentBadgeClasses[u.department]}`}>
                              {u.department.charAt(0).toUpperCase() + u.department.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground min-w-[70px]">
                          {u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Manager' : 'Consulente'}
                        </span>

                        {/* Edit button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-primary h-7 w-7 p-0"
                          onClick={() => openEditModal(u)}
                          title="Modifica info"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Deactivate/Reactivate */}
                        {!isMe && (
                          <>
                            {u.is_active ? (
                              confirmDelete === u.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-7 px-2"
                                    onClick={() => { deactivateUser.mutate(u.id); setConfirmDelete(null); }}
                                  >
                                    Conferma
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-7 px-2"
                                    onClick={() => setConfirmDelete(null)}
                                  >
                                    No
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                                  onClick={() => setConfirmDelete(u.id)}
                                  title="Disattiva account"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-emerald-600 h-7 w-7 p-0"
                                onClick={() => reactivateUser.mutate(u.id)}
                                title="Riattiva account"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup Dati
            </CardTitle>
            <CardDescription>Scarica un backup completo di tutti i dati</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button onClick={handleBackup} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Scarica Backup JSON
              </Button>
              <p className="text-xs text-muted-foreground">
                {clients.length} clienti, {projects.length} progetti, {tasks.length} task, {ideas.length} idee
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supabase */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connessione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {connected ? (
                <><Wifi className="h-4 w-4 text-green-500" /><span className="text-sm text-green-600 dark:text-green-400 font-medium">Connesso</span></>
              ) : (
                <><WifiOff className="h-4 w-4 text-yellow-500" /><span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Offline</span></>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Info App</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p><strong>Versione:</strong> 2.0.0</p>
            <p><strong>Stack:</strong> React + Vite + Tailwind + Supabase</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent onClose={() => setEditingUser(null)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Membro</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{
                    background: editDept && departmentColors[editDept]
                      ? `linear-gradient(135deg, ${departmentColors[editDept]}, ${departmentColors[editDept]}cc)`
                      : 'linear-gradient(135deg, #9B8EBD, #7B9BBF)'
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
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nome e Cognome"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="email@dreamteam.it"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Ruolo</label>
                <Select
                  options={roleOptions}
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Area</label>
                <Select
                  options={departmentOptions}
                  value={editDept}
                  onChange={e => setEditDept(e.target.value)}
                />
              </div>

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
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
