/** Auth Service terintegrasi — mapping identifier login & RBAC
 *  - identifier hanya digit  → mahasiswa.nim → user terkait
 *  - identifier bukan digit  → users.username
 *  - verifikasi password_hash konsep (lihat auth-helper)
 */
import type { User, Mahasiswa, AuthSession, LoginCredentials, LoginResponse, UserRole } from '../types';
import { isNim, normalizeIdentifier, verifyPasswordConcept } from '../utils/auth-helper';

/** Sesi aktif di memori — ganti persistensi real (localStorage/cookie) di produksi */
const sessions: Map<string, AuthSession> = new Map();

/** Mock tabel `users` — di produksi: SELECT * FROM users WHERE ... */
const userStore: User[] = [];

/** Mock tabel `mahasiswa` — di produksi: SELECT * FROM mahasiswa WHERE ... */
const mahasiswaStore: Mahasiswa[] = [];

/**
 * Login: otentifikasi identifier & password, kembalikan LoginResponse.
 * Identifier digit → lookup mahasiswa.nim lalu user terkait; selain itu → users.username.
 */
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

  const session: AuthSession = {
    user,
    mahasiswa: user.role === 'mahasiswa' ? mahasiswa : undefined,
    access_token: crypto.randomUUID(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  sessions.set(user.id, session);

  return { success: true, session };
}

/** Hapus sesi aktif (logout). */
export function logout(): void {
  sessions.clear();
}

/** Ambil sesi pertama yang aktif — di produksi: lookup by stored token/userId. */
export function getCurrentSession(): AuthSession | undefined {
  return sessions.values().next().value;
}

/** True bila ada sesi aktif. */
export function isAuthenticated(): boolean {
  return sessions.size > 0;
}

/** RBAC check: apakah sesi aktif memiliki role tertentu. */
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

/** Seed data demo: admin + 1 mahasiswa — panggil sekali saat app bootstrap. */
export function initMockData(): void {
  userStore.length = 0;
  mahasiswaStore.length = 0;
  sessions.clear();

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
