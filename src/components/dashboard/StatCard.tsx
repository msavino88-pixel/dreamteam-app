import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
  accentColor?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, accentColor }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-[28px] bg-card text-card-foreground shadow-soft border-0 p-5 md:p-6 relative overflow-hidden",
      className
    )}>
      {accentColor && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[28px]" style={{ background: accentColor }} />
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-label text-muted-foreground uppercase">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs font-medium", trend.value >= 0 ? "text-accent-success" : "text-destructive")}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="rounded-2xl bg-muted p-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
