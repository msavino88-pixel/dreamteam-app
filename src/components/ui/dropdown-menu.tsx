import { useState, useRef, useEffect, type ReactNode } from 'react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        {trigger}
      </div>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-card border-0 rounded-2xl shadow-float overflow-hidden py-1.5"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick: (e: React.MouseEvent) => void;
  children: ReactNode;
  variant?: 'default' | 'danger';
}

export function DropdownItem({ onClick, children, variant = 'default' }: DropdownItemProps) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
        variant === 'danger'
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted'
      }`}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
    >
      {children}
    </button>
  );
}
