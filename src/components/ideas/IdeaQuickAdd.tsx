import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lightbulb } from 'lucide-react';

interface IdeaQuickAddProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (idea: { title: string; description: string; tags: string[] }) => void;
}

export function IdeaQuickAdd({ open, onOpenChange, onSave }: IdeaQuickAddProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    });
    setTitle('');
    setDescription('');
    setTagsInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Nuova Idea
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Titolo dell'idea..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <Textarea
              placeholder="Descrivi la tua idea..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Input
              placeholder="Tag separati da virgola (es: AI, CRM, innovazione)"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit">Salva Idea</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
