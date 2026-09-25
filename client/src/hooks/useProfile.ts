import { useCallback, useEffect, useState } from 'react';
import { fetchProfile, saveProfile, type ProfileData } from '../api/profile';

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProfile();
      setProfile(data);
      setError(null);
    } catch {
      setError('No se pudo cargar tu perfil.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const update = useCallback(async (partial: Partial<ProfileData>) => {
    const updated = await saveProfile(partial);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, isLoading, error, update, reload };
}
