/** useAuth — React hook wrapper untuk auth.service
 *  state: user, session, isLoading, isAuthenticated, error
 *  actions: login, logout, checkSession
 */
import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services/auth.service';
import type { AuthSession, LoginCredentials, User, UserRole } from '../types';

export interface UseAuthState {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface UseAuthActions {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkSession: () => void;
  hasRole: (role: UserRole) => boolean;
}

/** Hook utama auth: sinkronkan state React dengan auth.service */
export function useAuth(): UseAuthState & UseAuthActions {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Sinkronkan state dari service (dipanggil saat mount & setelah aksi) */
  const checkSession = useCallback(() => {
    const current = authService.getCurrentSession() ?? null;
    setSession(current);
    setError(null);
  }, []);

  /** Login: set loading, panggil service, update state sesuai hasil */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setSession(result.session);
        return true;
      }
      // Login gagal → expose pesan error dari service
      setError(result.error.message);
      setSession(null);
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan tidak terduga');
      setSession(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Logout: clear service session & reset state */
  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    setError(null);
  }, []);

  /** Cek sesi saat mount (persistensi real: baca token dari localStorage) */
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /** RBAC check berdasarkan sesi aktif */
  const hasRole = useCallback(
    (role: UserRole): boolean => session?.user?.role === role,
    [session]
  );

  return {
    user: session?.user ?? null,
    session,
    isLoading,
    isAuthenticated: session !== null,
    error,
    login,
    logout,
    checkSession,
    hasRole,
  };
}

export default useAuth;
