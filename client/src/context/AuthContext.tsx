import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import axios, { AxiosError } from 'axios';
import api from '../api/axios';
import type { User, ApiErrorResponse } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Error enriquecido: además del mensaje general, trae el detalle por campo
// que manda express-validator (ej. "La contraseña debe incluir un número").
export class AuthError extends Error {
  fieldErrors?: { field: string; message: string }[];

  constructor(message: string, fieldErrors?: { field: string; message: string }[]) {
    super(message);
    this.name = 'AuthError';
    this.fieldErrors = fieldErrors;
  }
}

function buildAuthError(error: unknown, fallback: string): AuthError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;
    if (data?.errors && data.errors.length > 0) {
      return new AuthError(data.message || fallback, data.errors);
    }
    return new AuthError(data?.message || fallback);
  }
  return new AuthError(fallback);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await api.post<{ user: User }>('/auth/register', {
        name,
        email,
        password,
      });
      setUser(data.user);
    } catch (error) {
      throw buildAuthError(error, 'No se pudo crear la cuenta.');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ user: User }>('/auth/login', { email, password });
      setUser(data.user);
    } catch (error) {
      throw buildAuthError(error, 'No se pudo iniciar sesión.');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}