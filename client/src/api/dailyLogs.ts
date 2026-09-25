import api from './axios';

export interface DailyLogEntry {
  _id: string;
  dateKey: string;
  kcalConsumed?: number;
  notes?: string;
}

export interface MonthLogsResponse {
  entries: DailyLogEntry[];
}

export interface WeekLogsResponse {
  weekStart: string;
  weekEnd: string;
  entries: DailyLogEntry[];
  totalKcal: number;
}

export async function fetchMonthLogs(month: string): Promise<MonthLogsResponse> {
  const { data } = await api.get<MonthLogsResponse>(`/daily-logs/month?month=${month}`);
  return data;
}

export async function fetchWeekLogs(date?: string): Promise<WeekLogsResponse> {
  const query = date ? `?date=${date}` : '';
  const { data } = await api.get<WeekLogsResponse>(`/daily-logs/week${query}`);
  return data;
}

export async function saveDailyLog(
  date: string,
  kcalConsumed?: number,
  notes?: string
): Promise<DailyLogEntry> {
  const { data } = await api.post<{ entry: DailyLogEntry }>('/daily-logs', {
    date,
    kcalConsumed,
    notes,
  });
  return data.entry;
}