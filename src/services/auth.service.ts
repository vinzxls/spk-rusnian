/** Auth Service terintegrasi — mapping identifier login & RBAC
 *  - identifier hanya digit  → mahasiswa.nim → user terkait
 *  - identifier bukan digit  → users.username
 *  - verifikasi password_hash konsep (lihat auth-helper)
 *
 *  Sesi disimpan di `sessionStorage` agar tahan page reload.
 *  Di produksi: ganti dengan token HTTP-only cookie + verifikasi server.
 */
import type { User, Mahasiswa, AuthSession, LoginCredentials, LoginResponse, UserRole } from '../types';
import { isNim, normalizeIdentifier, verifyPasswordConcept } from '../utils/auth-helper';

const SESSION_KEY = 'rusnian.session';

/** Mock tabel `users` — di produksi: SELECT * FROM users WHERE ... */
const userStore: User[] = [];

/** Mock tabel `mahasiswa` — di produksi: SELECT * FROM mahasiswa WHERE ... */
const mahasiswaStore: Mahasiswa[] = [];

/** Sesi aktif di memori (diisi dari sessionStorage saat boot). */
let activeSession: AuthSession | undefined = undefined;

/** Muat sesi tersimpan dari sessionStorage. Aman terhadap storage yang nonaktif/blocked. */
function loadSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      activeSession = undefined;
      return;
    }
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user?.id) {
      sessionStorage.removeItem(SESSION_KEY);
      activeSession = undefined;
      return;
    }
    activeSession = parsed;
  } catch {
    activeSession = undefined;
  }
}

/** Simpan sesi aktif ke sessionStorage. Aman terhadap storage yang nonaktif/blocked. */
function persistSession(): void {
  try {
    if (activeSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify(activeSession));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage tidak tersedia — sesi tetap hidup di memori untuk tab ini */
  }
}

// Muat sesi tersimpan sekali saat modul di-load (tahan page reload).
loadSession();

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const identifier = normalizeIdentifier(credentials.username);
  const { password } = credentials;

  if (!identifier || !password) {
    return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Username / NIM dan password wajib diisi' } };
  }

  let user: User | undefined;
  let mahasiswa: Mahasiswa | undefined;

  if (isNim(identifier)) {
    mahasiswa = lookupMahasiswaByNim(identifier);
    if (!mahasiswa) {
      return { success: false, error: { code: 'USER_NOT_FOUND', message: 'Mahasiswa tidak ditemukan' } };
    }
    user = lookupUserById(mahasiswa.user_id);
  } else {
    user = lookupUserByUsername(identifier);
    if (user?.role === 'mahasiswa') {
      mahasiswa = lookupMahasiswaByUserId(user.id);
    }
  }

  if (!user) {
    return { success: false, error: { code: 'USER_NOT_FOUND', message: 'User tidak ditemukan' } };
  }

  if (!verifyPasswordConcept(password, user.password_hash)) {
    return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Password salah' } };
  }

  activeSession = {
    user,
    mahasiswa: user.role === 'mahasiswa' ? mahasiswa : undefined,
    access_token: crypto.randomUUID(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  persistSession();

  return { success: true, session: activeSession };
}

export function logout(): void {
  activeSession = undefined;
  persistSession();
}

export function getCurrentSession(): AuthSession | undefined {
  if (!activeSession) loadSession();
  return activeSession;
}

export function isAuthenticated(): boolean {
  return getCurrentSession() !== undefined;
}

export function hasRole(role: UserRole): boolean {
  return getCurrentSession()?.user?.role === role;
}

function lookupMahasiswaByNim(nim: string): Mahasiswa | undefined {
  return mahasiswaStore.find((m) => m.nim === nim);
}

function lookupMahasiswaByUserId(userId: string): Mahasiswa | undefined {
  return mahasiswaStore.find((m) => m.user_id === userId);
}

function lookupUserById(id: string): User | undefined {
  return userStore.find((u) => u.id === id);
}

function lookupUserByUsername(username: string): User | undefined {
  return userStore.find((u) => u.username === username);
}

export function initMockData(): void {
  userStore.length = 0;
  mahasiswaStore.length = 0;

  const now = new Date().toISOString();
  const demoHash = '$2a$10$N.z3HdLyZ5V8xG.IpxxZAu';
  userStore.push(
    { id: 'user-1', username: 'admin1', password_hash: demoHash, role: 'admin', nama_lengkap: 'Admin Prodi Ilmu Komputer', created_at: now, updated_at: now },
    { id: 'user-2', username: '202106070001', password_hash: demoHash, role: 'mahasiswa', nama_lengkap: 'Budi Santoso', created_at: now, updated_at: now }
  );
  mahasiswaStore.push({
    id: 'mah-1', nim: '202106070001', nama: 'Budi Santoso', prodi: 'Ilmu Komputer',
    angkatan: 2021, user_id: 'user-2', created_at: now, updated_at: now,
  });
}
