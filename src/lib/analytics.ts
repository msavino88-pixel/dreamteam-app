import type { ClientSpending, ClientInteraction, ClientMetrics } from '@/types';
import { daysSince } from './formatting';

export function calculateClientMetrics(
  spending: ClientSpending[],
  interactions: ClientInteraction[],
  activeProjectCount: number
): ClientMetrics {
  const totalSpent = spending
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + s.amount, 0);

  const paidSpending = spending.filter(s => s.payment_status === 'paid');
  const averageSpending = paidSpending.length > 0 ? totalSpent / paidSpending.length : 0;

  const sortedSpending = [...spending].sort(
    (a, b) => new Date(b.payment_date || b.created_at).getTime() - new Date(a.payment_date || a.created_at).getTime()
  );
  const lastSpendingDate = sortedSpending[0]?.payment_date || sortedSpending[0]?.created_at || null;

  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.interaction_date).getTime() - new Date(a.interaction_date).getTime()
  );
  const lastInteractionDate = sortedInteractions[0]?.interaction_date || null;

  const daysSinceSpending = daysSince(lastSpendingDate);
  const daysSinceInteraction = daysSince(lastInteractionDate);

  let churnRisk: 'low' | 'medium' | 'high' = 'low';
  if (daysSinceSpending !== null && daysSinceSpending > 180) churnRisk = 'high';
  else if (daysSinceSpending !== null && daysSinceSpending > 90) churnRisk = 'medium';
  if (daysSinceInteraction !== null && daysSinceInteraction > 60 && churnRisk !== 'high') churnRisk = 'medium';

  return {
    total_spent: totalSpent,
    average_spending: averageSpending,
    last_spending_date: lastSpendingDate,
    days_since_last_spending: daysSinceSpending,
    total_interactions: interactions.length,
    last_interaction_date: lastInteractionDate,
    days_since_last_interaction: daysSinceInteraction,
    active_projects: activeProjectCount,
    lifetime_value: totalSpent,
    churn_risk: churnRisk,
  };
}
