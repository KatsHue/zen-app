import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { WeightEntry } from '../api/weights';

function formatShortDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export default function WeightChart({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2) {
    return (
      <p className="zen-footer-text" style={{ marginTop: 0 }}>
        Registra tu peso al menos dos días distintos para ver la gráfica.
      </p>
    );
  }

  const data = entries.map((e) => ({ dateKey: e.dateKey, weightKg: e.weightKg }));

  return (
    <div className="zen-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--zen-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="dateKey"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11, fill: 'var(--zen-text-soft)' }}
            axisLine={{ stroke: 'var(--zen-border)' }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 11, fill: 'var(--zen-text-soft)' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            labelFormatter={(label: string) => formatShortDate(label)}
            formatter={(value: number) => [`${value} kg`, 'Peso']}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--zen-border)',
              fontSize: '0.85rem',
            }}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="var(--zen-primary)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--zen-primary)' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}