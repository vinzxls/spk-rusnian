/**
 * useAuth — state autentikasi GLOBAL (React Context) di atas auth.service.
 *
 * Kenapa Context, bukan useState biasa:
 *   Sebelumnya setiap pemanggilan useAuth() membuat salinan state sendiri-sendiri.
 *   App dan ProtectedRoute punya sesi terpisah, sehingga setelah login App melihat
 *   user tapi ProtectedRoute masih melihat null → redirect ke /login → App redirect
 *   balik ke /admin/dashboard → loop tak berujung. Semua klik terasa "tidak berfungsi".
 *
 * Sekarang satu sumber kebenaran: AuthProvider menyimpan sesi sekali,
 * semua komponen membaca nilai yang sama.
 */
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authService from '../services/auth.service';
import type { AuthSession, LoginCredentials, User, UserRole } from '../types';

export interface UseAuthState {
  user: User | null;
  session: AuthSession | null;
  /** True selama sesi awal dibaca dari storage / selama proses login */
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

export type AuthContextValue = UseAuthState & UseAuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

/** Provider tunggal — dibungkus di main.tsx, di luar <App />. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  // Mulai true: jangan ambil keputusan redirect sebelum sesi tersimpan dibaca.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Bootstrap: siapkan data demo lalu pulihkan sesi dari sessionStorage. */
  useEffect(() => {
    authService.initMockData();
    setSession(authService.getCurrentSession() ?? null);
    setIsLoading(false);
  }, []);

  const checkSession = useCallback(() => {
    setSession(authService.getCurrentSession() ?? null);
    setError(null);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      if (result.success) {
        setSession(result.session);
        return true;
      }
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

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    setError(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole): boolean => session?.user?.role === role,
    [session]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      isAuthenticated: session !== null,
      error,
      login,
      logout,
      checkSession,
      hasRole,
    }),
    [session, isLoading, error, login, logout, checkSession, hasRole]
  );

  // createElement dipakai (bukan JSX) karena file ini .ts, bukan .tsx.
  return createElement(AuthContext.Provider, { value }, children);
}

/** Hook utama auth: baca sesi global dari context. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() harus dipakai di dalam <AuthProvider>');
  }
  return ctx;
}

export default useAuth;
