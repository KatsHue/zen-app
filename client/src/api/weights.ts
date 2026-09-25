import api from './axios';

export interface WeightEntry {
  _id: string;
  dateKey: string;
  weightKg: number;
}

export interface WeightsResponse {
  entries: WeightEntry[];
  latestWeightKg: number | null;
  rollingAverage7d: number | null;
}

export async function fetchWeights(limit = 30): Promise<WeightsResponse> {
  const { data } = await api.get<WeightsResponse>(`/weights?limit=${limit}`);
  return data;
}

export async function logWeight(weightKg: number, date?: string): Promise<WeightEntry> {
  const { data } = await api.post<{ entry: WeightEntry }>('/weights', { weightKg, date });
  return data.entry;
}
