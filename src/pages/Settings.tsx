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
import { useUsers } from '@/hooks/useUsers';
import {
  Database, Wifi, WifiOff, Moon, Sun, Download,
  UserPlus, Shield, Mail, CheckCircle2
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
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useAllTasks();
  const { data: ideas = [] } = useIdeas();
  const { data: spending = [] } = useAllSpending();
  const { data: interactions = [] } = useInteractions();
  const { data: users = [] } = useUsers();

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
        });
      }

      setInviteMsg(`Membro "${inviteName}" creato! Credenziali: ${inviteEmail} / ${tempPassword}`);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('consultant');
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
                className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ruolo</label>
                    <Select options={roleOptions} value={inviteRole} onChange={e => setInviteRole(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={inviting} className="gap-2">
                    <Mail className="h-4 w-4" />
                    {inviting ? 'Creazione...' : 'Crea Account'}
                  </Button>
                </div>
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
    </div>
  );
}
