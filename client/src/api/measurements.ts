import api from './axios';

export interface MeasurementEntry {
  _id: string;
  monthKey: string;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  abdomenCm?: number;
}

export interface MeasurementsResponse {
  entries: MeasurementEntry[];
}

export async function fetchMeasurements(): Promise<MeasurementsResponse> {
  const { data } = await api.get<MeasurementsResponse>('/measurements');
  return data;
}

export async function saveMeasurement(
  month: string,
  values: { chestCm?: number; waistCm?: number; hipCm?: number; abdomenCm?: number }
): Promise<MeasurementEntry> {
  const { data } = await api.post<{ entry: MeasurementEntry }>('/measurements', { month, ...values });
  return data.entry;
}