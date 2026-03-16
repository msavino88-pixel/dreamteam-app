import { Search, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  onQuickAdd?: () => void;
  quickAddLabel?: string;
}

export function Header({ title, onQuickAdd, quickAddLabel }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-background/80 backdrop-blur-xl px-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca..."
            className="w-64 pl-9 bg-white/60 border-transparent rounded-xl focus:bg-white"
          />
        </div>

        {onQuickAdd && (
          <Button size="sm" onClick={onQuickAdd} className="rounded-xl gap-1.5 bg-[#1a1a1e] hover:bg-[#2a2a2e] text-white">
            <Plus className="h-4 w-4" />
            {quickAddLabel || 'Nuovo'}
          </Button>
        )}

        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5 text-foreground/60" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#D05A5A]" />
        </Button>
      </div>
    </header>
  );
}
