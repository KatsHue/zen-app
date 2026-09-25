function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

interface MonthCalendarProps {
  year: number;
  month: number; // 1-12
  selectedDateKey: string;
  todayDateKey: string;
  loggedDateKeys: Set<string>;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthCalendar({
  year,
  month,
  selectedDateKey,
  todayDateKey,
  loggedDateKeys,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();

  const firstWeekdayMonBased = (firstOfMonth.getDay() + 6) % 7;

  const monthLabel = firstOfMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array(firstWeekdayMonBased).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="zen-calendar">
      <div className="zen-calendar__header">
        <button type="button" className="zen-calendar__nav-btn" onClick={onPrevMonth} aria-label="Mes anterior">
          ‹
        </button>
        <span className="zen-calendar__title">{monthLabel}</span>
        <button type="button" className="zen-calendar__nav-btn" onClick={onNextMonth} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="zen-calendar__grid">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="zen-calendar__weekday">
            {label}
          </div>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="zen-calendar__day zen-calendar__day--empty" />;
          }

          const dateKey = `${year}-${pad2(month)}-${pad2(day)}`;
          const isToday = dateKey === todayDateKey;
          const isSelected = dateKey === selectedDateKey;
          const hasLog = loggedDateKeys.has(dateKey);

          return (
            <button
              key={dateKey}
              type="button"
              className={[
                'zen-calendar__day',
                isToday ? 'zen-calendar__day--today' : '',
                isSelected ? 'zen-calendar__day--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDate(dateKey)}
            >
              {day}
              {hasLog && <span className="zen-calendar__day-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}