import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ClientSpending } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatting';

interface SpendingChartProps {
  spending: ClientSpending[];
}

export function SpendingChart({ spending }: SpendingChartProps) {
  const monthlyData = spending.reduce<Record<string, number>>((acc, s) => {
    const date = s.payment_date || s.created_at;
    const month = date.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + s.amount;
    return acc;
  }, {});

  const data = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
      amount,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Storico Spese</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Nessuna spesa registrata</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Storico Spese</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Importo']}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
