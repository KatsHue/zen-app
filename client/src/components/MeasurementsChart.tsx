import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import type { MeasurementEntry } from '../api/measurements';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
}

const LINES = [
  { key: 'chestCm', name: 'Pecho', color: '#6b9080' },
  { key: 'waistCm', name: 'Cintura', color: '#4f6f5c' },
  { key: 'hipCm', name: 'Cadera', color: '#a4c3a2' },
  { key: 'abdomenCm', name: 'Abdomen', color: '#b5654a' },
] as const;

export default function MeasurementsChart({ entries }: { entries: MeasurementEntry[] }) {
  if (entries.length < 2) {
    return (
      <p className="zen-footer-text" style={{ marginTop: 0 }}>
        Registra medidas de al menos dos meses distintos para ver la gráfica.
      </p>
    );
  }

  const data = entries.map((e) => ({
    monthKey: e.monthKey,
    chestCm: e.chestCm,
    waistCm: e.waistCm,
    hipCm: e.hipCm,
    abdomenCm: e.abdomenCm,
  }));

  return (
    <div className="zen-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--zen-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="monthKey"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 11, fill: 'var(--zen-text-soft)' }}
            axisLine={{ stroke: 'var(--zen-border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--zen-text-soft)' }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            labelFormatter={(label: string) => formatMonthLabel(label)}
            formatter={(value: number, name: string) => [`${value} cm`, name]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--zen-border)',
              fontSize: '0.85rem',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
          {LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}