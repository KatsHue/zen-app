import { useEffect, useState, type FormEvent } from 'react';
import MeasurementsChart from './MeasurementsChart';
import { fetchMeasurements, saveMeasurement, type MeasurementEntry } from '../api/measurements';
import { currentMonthKey } from '../utils/date';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

export default function MeasurementsTab() {
  const today = currentMonthKey();

  const [entries, setEntries] = useState<MeasurementEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [monthInput, setMonthInput] = useState(today);
  const [chestInput, setChestInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipInput, setHipInput] = useState('');
  const [abdomenInput, setAbdomenInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = () => {
    setIsLoading(true);
    fetchMeasurements()
      .then((res) => setEntries(res.entries))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEditingPastMonth = monthInput !== today;

  const handleSelectHistory = (entry: MeasurementEntry) => {
    setMonthInput(entry.monthKey);
    setChestInput(entry.chestCm !== undefined ? String(entry.chestCm) : '');
    setWaistInput(entry.waistCm !== undefined ? String(entry.waistCm) : '');
    setHipInput(entry.hipCm !== undefined ? String(entry.hipCm) : '');
    setAbdomenInput(entry.abdomenCm !== undefined ? String(entry.abdomenCm) : '');
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setMonthInput(today);
    setChestInput('');
    setWaistInput('');
    setHipInput('');
    setAbdomenInput('');
    setMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const toNumberOrUndefined = (v: string) => (v.trim() === '' ? undefined : Number(v));
      await saveMeasurement(monthInput, {
        chestCm: toNumberOrUndefined(chestInput),
        waistCm: toNumberOrUndefined(waistInput),
        hipCm: toNumberOrUndefined(hipInput),
        abdomenCm: toNumberOrUndefined(abdomenInput),
      });
      setMessage(isEditingPastMonth ? `Medidas de ${formatMonthLabel(monthInput)} actualizadas.` : 'Medidas guardadas.');
      handleCancelEdit();
      reload();
    } catch {
      setMessage('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="zen-card zen-card--wide">
      <div className="zen-card__header" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.2rem' }}>Tus medidas</h1>
        <p>Pecho, cintura, cadera y abdomen — un registro por mes.</p>
      </div>

      {isEditingPastMonth && (
        <div className="zen-warning" style={{ marginBottom: 12, marginTop: 0 }}>
          Estás corrigiendo <strong>{formatMonthLabel(monthInput)}</strong>, no el mes actual.{' '}
          <button
            type="button"
            onClick={handleCancelEdit}
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
            Cancelar y volver al mes actual
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="zen-field">
          <label htmlFor="measurementMonth">Mes</label>
          <input
            id="measurementMonth"
            type="month"
            value={monthInput}
            max={today}
            onChange={(e) => setMonthInput(e.target.value)}
          />
        </div>

        <div className="zen-field-row">
          <div className="zen-field">
            <label htmlFor="chestCm">Pecho (cm)</label>
            <input
              id="chestCm"
              type="number"
              step="0.1"
              min={0}
              max={300}
              value={chestInput}
              onChange={(e) => setChestInput(e.target.value)}
            />
          </div>
          <div className="zen-field">
            <label htmlFor="waistCm">Cintura (cm)</label>
            <input
              id="waistCm"
              type="number"
              step="0.1"
              min={0}
              max={300}
              value={waistInput}
              onChange={(e) => setWaistInput(e.target.value)}
            />
          </div>
        </div>

        <div className="zen-field-row">
          <div className="zen-field">
            <label htmlFor="hipCm">Cadera (cm)</label>
            <input
              id="hipCm"
              type="number"
              step="0.1"
              min={0}
              max={300}
              value={hipInput}
              onChange={(e) => setHipInput(e.target.value)}
            />
          </div>
          <div className="zen-field">
            <label htmlFor="abdomenCm">Abdomen (cm)</label>
            <input
              id="abdomenCm"
              type="number"
              step="0.1"
              min={0}
              max={300}
              value={abdomenInput}
              onChange={(e) => setAbdomenInput(e.target.value)}
            />
          </div>
        </div>

        {message && (
          <p className="zen-footer-text" style={{ marginTop: 0, marginBottom: 12 }}>
            {message}
          </p>
        )}

        <button type="submit" className="zen-btn" disabled={isSaving}>
          {isSaving ? 'Guardando...' : isEditingPastMonth ? 'Actualizar mes' : 'Guardar mes'}
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--zen-primary-dark)', marginBottom: 10 }}>Tendencia</h3>
        {!isLoading && <MeasurementsChart entries={entries} />}
      </div>

      {!isLoading && entries.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--zen-primary-dark)', marginBottom: 10 }}>
            Historial
          </h3>
          <p className="zen-footer-text" style={{ marginTop: 0, marginBottom: 8, textAlign: 'left' }}>
            Toca un mes para corregirlo.
          </p>
          <div className="zen-history-list">
            {[...entries]
              .reverse()
              .map((entry) => (
                <button
                  type="button"
                  className="zen-history-row zen-history-row--clickable"
                  key={entry._id}
                  onClick={() => handleSelectHistory(entry)}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: '10px 14px' }}
                >
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {formatMonthLabel(entry.monthKey)}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--zen-text-soft)' }}>
                    Pecho {entry.chestCm ?? '—'} · Cintura {entry.waistCm ?? '—'} · Cadera {entry.hipCm ?? '—'} ·
                    Abdomen {entry.abdomenCm ?? '—'}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}