import { formatDistanceToNow, format, differenceInDays, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return format(parseISO(date), 'dd/MM/yyyy', { locale: it });
}

export function formatDateTime(date: string | null): string {
  if (!date) return '-';
  return format(parseISO(date), 'dd/MM/yyyy HH:mm', { locale: it });
}

export function formatRelativeDate(date: string | null): string {
  if (!date) return '-';
  return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: it });
}

export function daysSince(date: string | null): number | null {
  if (!date) return null;
  return differenceInDays(new Date(), parseISO(date));
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export const statusLabels: Record<string, string> = {
  // Client
  active: 'Attivo',
  inactive: 'Inattivo',
  lead: 'Lead',
  churned: 'Perso',
  // Project
  planning: 'Pianificazione',
  paused: 'In pausa',
  completed: 'Completato',
  archived: 'Archiviato',
  // Task
  todo: 'Da fare',
  in_progress: 'In corso',
  review: 'In revisione',
  done: 'Fatto',
  // Idea
  new: 'Nuova',
  evaluating: 'In valutazione',
  approved: 'Approvata',
  rejected: 'Rifiutata',
  implemented: 'Implementata',
  // Payment
  paid: 'Pagato',
  pending: 'In attesa',
  overdue: 'Scaduto',
};

export const priorityLabels: Record<string, string> = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
};

export const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  lead: 'bg-blue-100 text-blue-800',
  churned: 'bg-red-100 text-red-800',
  planning: 'bg-yellow-100 text-yellow-800',
  paused: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  new: 'bg-blue-100 text-blue-800',
  evaluating: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  implemented: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
};

export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};
