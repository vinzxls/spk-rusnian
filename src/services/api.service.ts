/**
 * Klien HTTP ke `api.php` di hosting.
 *
 * Semua fungsi di sini sengaja "tidak pernah melempar error": aplikasi tetap
 * bisa dipakai saat offline / saat api.php belum diunggah. Pemanggil cukup
 * memeriksa nilai balik `null` atau `false`.
 *
 * Base URL dapat dioverride lewat variabel lingkungan `VITE_API_URL`, berguna
 * bila frontend dan backend diletakkan di host berbeda.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const ENDPOINT = `${BASE}/api.php`

/** Bentuk state yang disimpan server. Koleksi tidak ada = `null`. */
export interface ServerState {
  users?: unknown
  mahasiswa?: unknown
  kuesioner?: unknown
  ahp?: unknown
  kriteria?: unknown
  subkriteria?: unknown
}

export interface StateResponse {
  ok: boolean
  empty: boolean
  state: ServerState
}

async function postJson<T>(url: string, payload: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Offline, api.php belum ada, atau CORS ditolak — anggap server tidak tersedia.
    return null
  }
}

/** Ambil seluruh state dari server. `null` bila server tidak dapat dihubungi. */
export async function fetchState(): Promise<StateResponse | null> {
  try {
    const res = await fetch(`${ENDPOINT}?action=state`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as StateResponse
    if (!data || data.ok !== true) return null
    return data
  } catch {
    return null
  }
}

/** Kirim satu koleksi (users/mahasiswa/kuesioner/ahp/...) ke server. */
export async function pushCollection(collection: string, data: unknown): Promise<boolean> {
  const hasil = await postJson<{ ok: boolean }>(`${ENDPOINT}?action=push`, {
    collection,
    data,
  })
  return hasil?.ok === true
}

/**
 * Kirim satu jawaban kuesioner secara atomik.
 *
 * Berbeda dengan `pushCollection('kuesioner', ...)` yang menimpa seluruh array,
 * endpoint ini hanya menambah/mengganti satu record di sisi server. Dengan
 * begitu dua mahasiswa yang submit bersamaan tidak saling menghapus jawaban.
 */
export async function submitKuesioner(record: unknown): Promise<boolean> {
  const hasil = await postJson<{ ok: boolean }>(`${ENDPOINT}?action=submit-kuesioner`, {
    record,
  })
  return hasil?.ok === true
}

export const api = {
  fetchState,
  pushCollection,
  submitKuesioner,
  endpoint: ENDPOINT,
}

export default api
