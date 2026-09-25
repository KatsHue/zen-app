import { useState, type FormEvent } from 'react';
import WeightChart from './WeightChart';
import type { WeightsResponse } from '../api/weights';
import { todayDateKey, dateKeyDaysAgo } from '../utils/date';

const CHART_RANGES = [
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: '1 año' },
] as const;

interface WeightTabProps {
  data: WeightsResponse | null;
  isLoading: boolean;
  weightInput: string;
  onWeightInputChange: (value: string) => void;
  weightDate: string;
  onWeightDateChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  isSubmitting: boolean;
  message: string | null;
  onSelectHistoryEntry: (dateKey: string, weightKg: number) => void;
}

export default function WeightTab({
  data,
  isLoading,
  weightInput,
  onWeightInputChange,
  weightDate,
  onWeightDateChange,
  onSubmit,
  isSubmitting,
  message,
  onSelectHistoryEntry,
}: WeightTabProps) {
  const today = todayDateKey();
  const isEditingPastDate = weightDate !== today;

  const [chartRangeDays, setChartRangeDays] = useState<number>(90);
  const cutoff = dateKeyDaysAgo(chartRangeDays);
  const chartEntries = data ? data.entries.filter((e) => e.dateKey >= cutoff) : [];

  return (
    <div className="zen-card zen-card--wide">
      <div className="zen-card__header" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.2rem' }}>Tu peso</h1>
        <p>Regístralo a diario; usamos el promedio de los últimos 7 días para calcular tus objetivos.</p>
      </div>

      {isEditingPastDate && (
        <div className="zen-warning" style={{ marginBottom: 12, marginTop: 0 }}>
          Estás corrigiendo el peso del <strong>{weightDate}</strong>, no el de hoy.{' '}
          <button
            type="button"
            onClick={() => {
              onWeightDateChange(today);
              onWeightInputChange('');
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              marginLeft: 4,
              color: 'inherit',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Cancelar y volver a hoy
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="zen-weight-row">
        <input
          type="date"
          value={weightDate}
          max={today}
          onChange={(e) => onWeightDateChange(e.target.value)}
          style={{ flex: '0 0 150px' }}
          className="zen-weight-row__date"
        />
        <input
          type="number"
          step="0.1"
          min={20}
          max={400}
          placeholder="Peso (kg)"
          value={weightInput}
          onChange={(e) => onWeightInputChange(e.target.value)}
        />
        <button type="submit" className="zen-btn zen-btn--small" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditingPastDate ? 'Actualizar' : 'Guardar'}
        </button>
      </form>

      {message && (
        <p className="zen-footer-text" style={{ marginTop: 8 }}>
          {message}
        </p>
      )}

      {!isLoading && data && (data.latestWeightKg || data.rollingAverage7d) && (
        <div className="zen-result-card" style={{ marginTop: 16 }}>
          <div className="zen-result-row">
            <span>Peso más reciente</span>
            <span>{data.latestWeightKg ? `${data.latestWeightKg} kg` : '—'}</span>
          </div>
          <div className="zen-result-row">
            <span>Promedio 7 días</span>
            <span>{data.rollingAverage7d ? `${data.rollingAverage7d} kg` : '—'}</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <h3 style={{ fontSize: '0.95rem', color: 'var(--zen-primary-dark)', margin: 0 }}>Tendencia</h3>
          <div className="zen-tabs">
            {CHART_RANGES.map((range) => (
              <button
                key={range.days}
                type="button"
                className={`zen-tab ${chartRangeDays === range.days ? 'active' : ''}`}
                onClick={() => setChartRangeDays(range.days)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <WeightChart entries={chartEntries} />
      </div>

      {data && data.entries.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--zen-primary-dark)', marginBottom: 10 }}>
            Historial reciente
          </h3>
          <p className="zen-footer-text" style={{ marginTop: 0, marginBottom: 8, textAlign: 'left' }}>
            Toca un día para corregirlo.
          </p>
          <div className="zen-history-list">
            {[...data.entries]
              .reverse()
              .slice(0, 14)
              .map((entry) => (
                <button
                  type="button"
                  className="zen-history-row zen-history-row--clickable"
                  key={entry._id}
                  onClick={() => onSelectHistoryEntry(entry.dateKey, entry.weightKg)}
                >
                  <span>{entry.dateKey}</span>
                  <span>{entry.weightKg} kg</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}