import { useEffect, useMemo, useState, type FormEvent } from 'react';
import MonthCalendar from './MonthCalendar';
import { fetchMonthLogs, fetchWeekLogs, saveDailyLog, type DailyLogEntry, type WeekLogsResponse } from '../api/dailyLogs';
import { todayDateKey } from '../utils/date';

function monthKeyOf(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function DiaryTab() {
  const today = todayDateKey();
  const [todayYear, todayMonth] = today.split('-').map(Number);

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [selectedDateKey, setSelectedDateKey] = useState(today);

  const [monthEntries, setMonthEntries] = useState<DailyLogEntry[]>([]);
  const [weekSummary, setWeekSummary] = useState<WeekLogsResponse | null>(null);
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);

  const [kcalInput, setKcalInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingMonth(true);
    fetchMonthLogs(monthKeyOf(viewYear, viewMonth))
      .then((res) => {
        if (!cancelled) setMonthEntries(res.entries);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMonth(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth]);

  useEffect(() => {
    let cancelled = false;
    fetchWeekLogs(selectedDateKey).then((res) => {
      if (!cancelled) setWeekSummary(res);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedDateKey]);

  useEffect(() => {
    const existing = monthEntries.find((e) => e.dateKey === selectedDateKey);
    setKcalInput(existing?.kcalConsumed !== undefined ? String(existing.kcalConsumed) : '');
    setNotesInput(existing?.notes ?? '');
    setSaveMessage(null);
  }, [selectedDateKey, monthEntries]);

  const loggedDateKeys = useMemo(
    () =>
      new Set(
        monthEntries
          .filter((e) => (e.kcalConsumed !== undefined && e.kcalConsumed !== null) || (e.notes && e.notes.trim()))
          .map((e) => e.dateKey)
      ),
    [monthEntries]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const kcalValue = kcalInput.trim() === '' ? undefined : Number(kcalInput);
      await saveDailyLog(selectedDateKey, kcalValue, notesInput);

      const [monthRes, weekRes] = await Promise.all([
        fetchMonthLogs(monthKeyOf(viewYear, viewMonth)),
        fetchWeekLogs(selectedDateKey),
      ]);
      setMonthEntries(monthRes.entries);
      setWeekSummary(weekRes);
      setSaveMessage('Registro guardado.');
    } catch {
      setSaveMessage('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [selectedDateKey]);

  return (
    <div className="zen-card zen-card--wide">
      <div className="zen-card__header" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.2rem' }}>Tu diario</h1>
        <p>Anota tus kcal consumidas y notas de cada día.</p>
      </div>

      {!isLoadingMonth && (
        <MonthCalendar
          year={viewYear}
          month={viewMonth}
          selectedDateKey={selectedDateKey}
          todayDateKey={today}
          loggedDateKeys={loggedDateKeys}
          onSelectDate={setSelectedDateKey}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      )}

      <hr className="zen-divider" />

      <p style={{ fontWeight: 600, color: 'var(--zen-primary-dark)', marginBottom: 12, textTransform: 'capitalize' }}>
        {selectedDateLabel}
      </p>

      <form onSubmit={handleSave}>
        <div className="zen-field">
          <label htmlFor="kcalConsumed">Kcal consumidas</label>
          <input
            id="kcalConsumed"
            type="number"
            min={0}
            max={20000}
            value={kcalInput}
            onChange={(e) => setKcalInput(e.target.value)}
            placeholder="Ej. 1800"
          />
        </div>

        <div className="zen-field">
          <label htmlFor="notes">Notas</label>
          <textarea
            id="notes"
            rows={3}
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder="¿Cómo te sentiste hoy? ¿Algo que anotar sobre tus comidas?"
          />
        </div>

        {saveMessage && (
          <p className="zen-footer-text" style={{ marginTop: 0, marginBottom: 12 }}>
            {saveMessage}
          </p>
        )}

        <button type="submit" className="zen-btn" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar día'}
        </button>
      </form>

      {weekSummary && (
        <div className="zen-result-card" style={{ marginTop: 20 }}>
          <h3>
            Semana del {weekSummary.weekStart} al {weekSummary.weekEnd}
          </h3>
          <div className="zen-result-row">
            <span>Total kcal de la semana</span>
            <span>{weekSummary.totalKcal.toLocaleString('es-MX')} kcal</span>
          </div>
          <div className="zen-result-row">
            <span>Días registrados</span>
            <span>{weekSummary.entries.length} / 7</span>
          </div>
        </div>
      )}
    </div>
  );
}