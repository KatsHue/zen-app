import api from './axios';
import type { ActivityLevel, DialysisModality, GoalKey, Sex } from '../utils/health';

export interface ProfileData {
  sex: Sex;
  age?: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  renalEnabled: boolean;
  renalStageId: string;
  dialysisModality: DialysisModality;
  activeGoalKey: GoalKey;
  proteinGPerKg?: number;
}

export async function fetchProfile(): Promise<ProfileData | null> {
  const { data } = await api.get<{ profile: ProfileData | null }>('/profile');
  return data.profile;
}

export async function saveProfile(partial: Partial<ProfileData>): Promise<ProfileData> {
  const { data } = await api.put<{ profile: ProfileData }>('/profile', partial);
  return data.profile;
}