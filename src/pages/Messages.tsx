import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMessages, useSendMessage, useMarkMessageRead } from '@/hooks/useMessages';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { formatRelativeDate } from '@/lib/formatting';
import {
  Send, Mail, MailOpen, ChevronRight, ArrowLeft, Reply
} from 'lucide-react';

export default function Messages() {
  const { profile } = useAuth();
  const { data: messages = [] } = useMessages(profile?.id);
  const { data: users = [] } = useUsers();
  const sendMessage = useSendMessage();
  const markRead = useMarkMessageRead();

  const [composeOpen, setComposeOpen] = useState(false);
  const [toUser, setToUser] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<typeof messages[0] | null>(null);
  const [filter, setFilter] = useState<'inbox' | 'sent'>('inbox');

  const filteredMessages = messages.filter(m =>
    filter === 'inbox' ? m.to_user_id === profile?.id : m.from_user_id === profile?.id
  );

  const unreadCount = messages.filter(m => m.to_user_id === profile?.id && !m.read).length;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !toUser || !content.trim()) return;
    sendMessage.mutate({
      from_user_id: profile.id,
      to_user_id: toUser,
      subject: subject.trim() || undefined,
      content: content.trim(),
    }, {
      onSuccess: () => {
        setComposeOpen(false);
        setToUser('');
        setSubject('');
        setContent('');
      }
    });
  };

  const openMessage = (msg: typeof messages[0]) => {
    setSelectedMsg(msg);
    if (msg.to_user_id === profile?.id && !msg.read) {
      markRead.mutate(msg.id);
    }
  };

  const handleReply = (msg: typeof messages[0]) => {
    const other = msg.from_user_id === profile?.id ? msg.to_user_id : msg.from_user_id;
    setToUser(other);
    setSubject(msg.subject ? `Re: ${msg.subject}` : '');
    setContent('');
    setSelectedMsg(null);
    setComposeOpen(true);
  };

  const userOptions = users.filter(u => u.id !== profile?.id).map(u => ({ value: u.id, label: u.full_name }));
  const getUserName = (id: string) => users.find(u => u.id === id)?.full_name || 'Utente';
  const getUserInitials = (id: string) => {
    const name = users.find(u => u.id === id)?.full_name || '?';
    return name.split(' ').map(n => n[0]).join('');
  };

  // Detail view
  if (selectedMsg) {
    const isIncoming = selectedMsg.to_user_id === profile?.id;
    const otherUser = isIncoming ? selectedMsg.from_user_id : selectedMsg.to_user_id;
    return (
      <div>
        <Header title="Messaggi" />
        <div className="p-4 md:p-6 space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMsg(null)} className="text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai messaggi
          </Button>
          <div className="rounded-[28px] bg-card shadow-soft p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-sm font-bold text-white">
                {getUserInitials(otherUser)}
              </div>
              <div>
                <p className="font-semibold text-sm">{isIncoming ? 'Da' : 'A'}: {getUserName(otherUser)}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(selectedMsg.created_at)}</p>
              </div>
            </div>
            {selectedMsg.subject && <h3 className="font-semibold">{selectedMsg.subject}</h3>}
            <p className="text-sm text-card-foreground/80 whitespace-pre-wrap">{selectedMsg.content}</p>
            <Button variant="outline" size="sm" onClick={() => handleReply(selectedMsg)} className="gap-2">
              <Reply className="h-4 w-4" /> Rispondi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Messaggi"
        onQuickAdd={() => setComposeOpen(true)}
        quickAddLabel="Nuovo Messaggio"
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'inbox' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('inbox')}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Ricevuti {unreadCount > 0 && <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
          </Button>
          <Button
            variant={filter === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('sent')}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Inviati
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredMessages.length} messagg{filteredMessages.length !== 1 ? 'i' : 'io'}
        </p>

        <div className="space-y-2">
          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {filter === 'inbox' ? 'Nessun messaggio ricevuto' : 'Nessun messaggio inviato'}
            </div>
          )}
          {filteredMessages.map(msg => {
            const otherUser = filter === 'inbox' ? msg.from_user_id : msg.to_user_id;
            const isUnread = filter === 'inbox' && !msg.read;
            return (
              <div
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`rounded-2xl bg-card shadow-soft p-4 cursor-pointer hover:shadow-float transition-all flex items-center gap-3 ${isUnread ? 'border-l-4 border-foreground' : ''}`}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {getUserInitials(otherUser)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold' : 'text-muted-foreground'}`}>
                      {getUserName(otherUser)}
                    </p>
                    {isUnread && <div className="h-2 w-2 rounded-full bg-foreground shrink-0" />}
                  </div>
                  {msg.subject && <p className="text-xs font-medium truncate">{msg.subject}</p>}
                  <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{formatRelativeDate(msg.created_at)}</span>
                  {isUnread ? <Mail className="h-3.5 w-3.5 text-foreground" /> : <MailOpen className="h-3.5 w-3.5 text-muted-foreground/40" />}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {composeOpen && (
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogContent onClose={() => setComposeOpen(false)} className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuovo Messaggio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Destinatario *</label>
                <Select
                  options={[{ value: '', label: 'Seleziona utente...' }, ...userOptions]}
                  value={toUser}
                  onChange={e => setToUser(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Oggetto</label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Oggetto del messaggio..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Messaggio *</label>
                <Textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Scrivi il tuo messaggio..."
                  rows={5}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={sendMessage.isPending || !toUser || !content.trim()} className="flex-1 gap-2">
                  <Send className="h-4 w-4" />
                  {sendMessage.isPending ? 'Invio...' : 'Invia'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>Annulla</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
