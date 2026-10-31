/** Auth Service terintegrasi — mapping identifier login & RBAC
 *  - identifier hanya digit  → mahasiswa.nim → user terkait
 *  - identifier bukan digit  → users.username
 *  - verifikasi password_hash konsep (lihat auth-helper)
 *
 *  Sesi disimpan di `sessionStorage` agar tahan page reload.
 *  Data akun disimpan di localStorage lewat services/user-store.
 *  Di produksi: ganti dengan token HTTP-only cookie + verifikasi server.
 */
import type { User, Mahasiswa, AuthSession, LoginCredentials, LoginResponse, UserRole } from '../types';
import { isNim, normalizeIdentifier, verifyPasswordConcept } from '../utils/auth-helper';
import {
  DEMO_PASSWORD_HASH,
  getMahasiswa,
  getUsers,
  saveMahasiswa,
  saveUsers,
  seedIfEmpty,
} from './user-store';

const SESSION_KEY = 'rusnian.session';

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
    // Segarkan objek user dari storage: data bisa berubah setelah halaman admin
    // mengedit/menghapus mahasiswa.
    const terkini = lookupUserById(parsed.user.id);
    activeSession = terkini ? { ...parsed, user: terkini } : parsed;
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
  const m = getMahasiswa().find((x) => x.nim === nim);
  return m ? toMahasiswa(m) : undefined;
}

function lookupMahasiswaByUserId(userId: string): Mahasiswa | undefined {
  const m = getMahasiswa().find((x) => x.user_id === userId);
  return m ? toMahasiswa(m) : undefined;
}

function lookupUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

function lookupUserByUsername(username: string): User | undefined {
  return getUsers().find((u) => u.username === username);
}

/** Buang field khusus tabel mahasiswa agar cocok dengan tipe `Mahasiswa`. */
function toMahasiswa(m: {
  id: string;
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}): Mahasiswa {
  return {
    id: m.id,
    nim: m.nim,
    nama: m.nama,
    prodi: m.prodi,
    angkatan: m.angkatan,
    user_id: m.user_id,
    created_at: m.created_at,
    updated_at: m.updated_at,
  };
}

/**
 * Siapkan data awal. Idempoten — hanya mengisi bila storage masih kosong,
 * sehingga data yang sudah ditambahkan admin tidak terhapus saat reload.
 */
export function initMockData(): void {
  seedIfEmpty();
}

/**
 * Daftarkan akun login untuk mahasiswa baru.
 *
 * Tanpa ini, mahasiswa yang ditambahkan lewat halaman Data Mahasiswa hanya masuk
 * ke tabel mahasiswa tanpa akun di tabel users, sehingga login dengan NIM selalu
 * gagal "Mahasiswa tidak ditemukan".
 */
export function registerMahasiswaAccount(input: {
  userId: string;
  nim: string;
  nama: string;
  prodi: string;
  fakultas?: string;
  angkatan: number;
}): void {
  const { userId, nim, nama, prodi, fakultas = 'MIPA', angkatan } = input;

  const users = getUsers();
  if (users.some((u) => u.username === nim)) return;

  const now = new Date().toISOString();
  saveUsers([
    ...users,
    {
      id: userId,
      username: nim,
      password_hash: DEMO_PASSWORD_HASH,
      role: 'mahasiswa',
      nama_lengkap: nama,
      created_at: now,
      updated_at: now,
    },
  ]);

  const daftar = getMahasiswa();
  if (daftar.some((m) => m.nim === nim)) return;

  saveMahasiswa([
    ...daftar,
    {
      id: `mah-${userId}`,
      user_id: userId,
      nim,
      nama,
      prodi,
      fakultas,
      angkatan,
      created_at: now,
      updated_at: now,
    },
  ]);
}

/** Hapus akun login mahasiswa saat datanya dihapus, agar NIM bisa dipakai ulang. */
export function unregisterMahasiswaAccount(nim: string): void {
  const users = getUsers();
  const target = users.find((u) => u.username === nim && u.role === 'mahasiswa');
  if (!target) return;

  saveUsers(users.filter((u) => u.id !== target.id));
  saveMahasiswa(getMahasiswa().filter((m) => m.user_id !== target.id));
}
