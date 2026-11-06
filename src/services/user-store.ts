/**
 * Penyimpanan akun & data mahasiswa (mock database untuk demo).
 *
 * Semua data disimpan di localStorage supaya penambahan mahasiswa lewat halaman
 * admin tidak hilang saat halaman di-refresh. Di produksi, modul ini diganti
 * pemanggilan API ke backend.
 *
 * Catatan penting: sebelumnya `users` dan `mahasiswa` adalah dua array terpisah
 * yang di-reset setiap aplikasi dimuat, sehingga mahasiswa baru tidak punya akun
 * login dan datanya lenyap setelah reload.
 */
import type { UserRole } from '../types'
import { triggerSync } from './sync.service'

const USERS_KEY = 'rusnian.users'
const MAHASISWA_KEY = 'rusnian.mahasiswa'

export interface StoredUser {
  id: string
  username: string
  password_hash: string
  role: UserRole
  nama_lengkap?: string
  created_at: string
  updated_at: string
}

export interface StoredMahasiswa {
  id: string
  user_id: string
  nim: string
  nama: string
  prodi: string
  fakultas: string
  angkatan: number
  alamat?: string
  created_at: string
  updated_at: string
}

/** Hash placeholder; verifikasi demo ada di utils/auth-helper.ts. */
export const DEMO_PASSWORD_HASH = '$2a$10$N.z3HdLyZ5V8xG.IpxxZAu'

function isBrowser(): boolean {
  return typeof localStorage !== 'undefined'
}

function read<T>(key: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* kuota penuh / storage diblokir — data tetap hidup di memori tab ini */
  }
}

export function getUsers(): StoredUser[] {
  return read<StoredUser[]>(USERS_KEY) ?? []
}

export function saveUsers(users: StoredUser[]): void {
  write(USERS_KEY, users)
  triggerSync('users')
}

export function getMahasiswa(): StoredMahasiswa[] {
  return read<StoredMahasiswa[]>(MAHASISWA_KEY) ?? []
}

export function saveMahasiswa(daftar: StoredMahasiswa[]): void {
  write(MAHASISWA_KEY, daftar)
  triggerSync('mahasiswa')
}

/**
 * Isi data demo bila storage masih kosong. Idempoten: tidak pernah menghapus
 * data yang sudah ada, jadi aman dipanggil setiap aplikasi mount.
 */
export function seedIfEmpty(): void {
  const now = new Date().toISOString()

  if (getUsers().length === 0) {
    saveUsers([
      {
        id: 'user-1',
        username: 'admin1',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'admin',
        nama_lengkap: 'Admin Prodi Ilmu Komputer',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user-2',
        username: '202106070001',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'mahasiswa',
        nama_lengkap: 'Budi Santoso',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'user-3',
        username: '202206070001',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'mahasiswa',
        nama_lengkap: 'Ani Wijaya',
        created_at: now,
        updated_at: now,
      },
    ])
  }

  if (getMahasiswa().length === 0) {
    saveMahasiswa([
      {
        id: 'mah-1',
        user_id: 'user-2',
        nim: '202106070001',
        nama: 'Budi Santoso',
        prodi: 'Ilmu Komputer',
        fakultas: 'MIPA',
        angkatan: 2021,
        alamat: 'Jl. Raya No. 1',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'mah-2',
        user_id: 'user-3',
        nim: '202206070001',
        nama: 'Ani Wijaya',
        prodi: 'Ilmu Komputer',
        fakultas: 'MIPA',
        angkatan: 2022,
        alamat: 'Jl. Achmad Yani No. 5',
        created_at: now,
        updated_at: now,
      },
    ])
  }
}

export const userStore = { getUsers, saveUsers, getMahasiswa, saveMahasiswa, seedIfEmpty }
export default userStore
