/**
 * Sinkronisasi localStorage ⇄ server (`api.php`).
 *
 * Alasan desain:
 *  - Aplikasi tetap bisa dipakai tanpa server (mode demo/offline). Semua
 *    pemanggilan di sini gagal dengan tenang bila `api.php` belum ada.
 *  - Saat aplikasi dibuka, data ditarik dari server SEKALI (hydrate) sebelum
 *    React dirender, supaya mahasiswa di perangkat lain melihat data terbaru.
 *  - Setiap perubahan dikirim per-koleksi, bukan seluruh state, agar dua
 *    pengguna yang menyimpan hal berbeda tidak saling menimpa.
 *  - Jawaban kuesioner memakai endpoint atomik `submit-kuesioner`, jadi dua
 *    mahasiswa yang submit bersamaan tidak menghapus jawaban satu sama lain.
 */
import { fetchState, pushCollection, submitKuesioner } from './api.service'

/** Koleksi server → key localStorage. */
export const COLLECTION_KEYS: Record<string, string> = {
  users: 'rusnian.users',
  mahasiswa: 'rusnian.mahasiswa',
  kuesioner: 'rusnian.kuesioner',
  ahp: 'rusnian.ahp',
  kriteria: 'rusnian.kriteria',
  subkriteria: 'rusnian.subkriteria',
}

/** Status koneksi server, ditampilkan di UI bila perlu. */
export type SyncStatus = 'unknown' | 'online' | 'offline'

let status: SyncStatus = 'unknown'
let hydrated = false

export function getSyncStatus(): SyncStatus {
  return status
}

export function isHydrated(): boolean {
  return hydrated
}

function isBrowser(): boolean {
  return typeof localStorage !== 'undefined'
}

function readLocal(key: string): unknown {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal(key: string, value: unknown): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* kuota penuh / storage diblokir */
  }
}

function isNonEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  return true
}

/**
 * Tarik data dari server ke localStorage. Aman dipanggil berkali-kali.
 *
 * Bila server masih kosong (pemasangan baru) tetapi browser sudah punya data
 * lokal, data lokal yang dikirim ke server agar tidak hilang.
 *
 * @returns `true` bila data server berhasil dimuat.
 */
export async function hydrateFromServer(): Promise<boolean> {
  if (hydrated) return status === 'online'

  const res = await fetchState()
  if (!res) {
    status = 'offline'
    hydrated = true
    return false
  }

  status = 'online'

  if (res.empty) {
    // Server kosong → unggah data lokal yang sudah ada (migrasi dari versi
    // localStorage). Bila lokal juga kosong, biarkan; seed akan mengisinya.
    for (const [collection, key] of Object.entries(COLLECTION_KEYS)) {
      const lokal = readLocal(key)
      if (isNonEmpty(lokal)) await pushCollection(collection, lokal)
    }
    hydrated = true
    return true
  }

  // Server punya data → jadikan sumber kebenaran.
  for (const [collection, key] of Object.entries(COLLECTION_KEYS)) {
    const nilai = res.state[collection as keyof typeof res.state]
    if (nilai !== null && nilai !== undefined) writeLocal(key, nilai)
  }

  hydrated = true
  return true
}

/** Kirim ulang satu koleksi dari localStorage ke server. */
async function pushKey(collection: string, key: string): Promise<boolean> {
  const data = readLocal(key)
  if (data === null) return false
  const ok = await pushCollection(collection, data)
  if (ok) status = 'online'
  return ok
}

/**
 * Tandai satu koleksi berubah dan kirim ke server.
 *
 * Debit: dipanggil dari `saveUsers`, `saveMahasiswa`, dst. Tidak pernah
 * melempar error sehingga penyimpanan lokal tidak pernah gagal gara-gara
 * jaringan.
 */
export function triggerSync(collection: keyof typeof COLLECTION_KEYS): void {
  const key = COLLECTION_KEYS[collection]
  if (!key) return
  void pushKey(collection as string, key)
}

/** Kirim satu jawaban kuesioner secara atomik (tanpa menimpa jawaban lain). */
export async function syncKuesionerEntry(record: unknown): Promise<boolean> {
  const ok = await submitKuesioner(record)
  if (ok) status = 'online'
  return ok
}

/** Ambil ulang seluruh data dari server lalu tulis ke localStorage. */
export async function refreshFromServer(): Promise<boolean> {
  hydrated = false
  return hydrateFromServer()
}

/**
 * Kirim semua koleksi lokal ke server (dipakai tombol "Kirim Data Lokal").
 *
 * Kuesioner TIDAK dikirim sebagai satu array. Kalau dikirim sebagai array, data
 * di server akan diganti seluruhnya dengan isi perangkat ini — jawaban
 * mahasiswa lain yang belum ada di perangkat ini akan hilang. Karena itu setiap
 * jawaban dikirim satu per satu lewat endpoint atomik (upsert per mahasiswa).
 */
export async function pushAll(): Promise<boolean> {
  let semuaBerhasil = true

  for (const [collection, key] of Object.entries(COLLECTION_KEYS)) {
    if (collection === 'kuesioner') {
      const daftar = readLocal(key)
      if (!Array.isArray(daftar) || daftar.length === 0) continue
      for (const record of daftar) {
        const ok = await syncKuesionerEntry(record)
        if (!ok) semuaBerhasil = false
      }
      continue
    }

    const ok = await pushKey(collection, key)
    if (!ok) semuaBerhasil = false
  }

  return semuaBerhasil
}

export const syncService = {
  hydrateFromServer,
  refreshFromServer,
  pushAll,
  triggerSync,
  syncKuesionerEntry,
  getSyncStatus,
  isHydrated,
  COLLECTION_KEYS,
}

export default syncService
