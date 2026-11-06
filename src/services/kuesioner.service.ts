/**
 * Penyimpanan jawaban kuesioner.
 *
 * Lokal (localStorage) dipakai sebagai cache supaya UI tetap responsif dan
 * aplikasi masih jalan tanpa server. Setiap submit juga dikirim ke server lewat
 * endpoint atomik `submit-kuesioner`, sehingga:
 *   - data tidak hilang saat mahasiswa berganti perangkat;
 *   - dua mahasiswa yang submit bersamaan tidak saling menimpa.
 */
import { syncKuesionerEntry } from './sync.service'

const STORAGE_KEY = 'rusnian.kuesioner'

export interface JawabanKuesioner {
  id: string
  mahasiswa_id: string
  jawaban: Record<string, number> // Map kode kriteria_subkriteria ke nilai 1-5
  submitted_at: string
}

class KuesionerService {
  private mockJawaban: JawabanKuesioner[] = []
  private initialized = false

  private isBrowser(): boolean {
    return typeof localStorage !== 'undefined'
  }

  private load(): void {
    if (this.initialized) return
    this.reloadFromStorage()
  }

  /** Baca ulang dari localStorage — dipakai setelah data server di-hydrate. */
  reloadFromStorage(): void {
    this.mockJawaban = []
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) this.mockJawaban = JSON.parse(raw) as JawabanKuesioner[]
      } catch {
        // storage rusak — mulai bersih
        this.mockJawaban = []
      }
    }
    this.initialized = true
  }

  private save(): void {
    if (!this.isBrowser()) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mockJawaban))
    } catch {
      /* kuota penuh — abaikan */
    }
  }

  async getStatus(mahasiswaId: string): Promise<boolean> {
    this.load()
    return this.mockJawaban.some((j) => j.mahasiswa_id === mahasiswaId)
  }

  async submit(mahasiswaId: string, jawaban: Record<string, number>): Promise<boolean> {
    this.load()
    const existingIndex = this.mockJawaban.findIndex((j) => j.mahasiswa_id === mahasiswaId)
    const entry: JawabanKuesioner = {
      id: `jwb-${Date.now()}`,
      mahasiswa_id: mahasiswaId,
      jawaban,
      submitted_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      this.mockJawaban[existingIndex] = entry
    } else {
      this.mockJawaban.push(entry)
    }

    this.save()

    // Kirim ke server tanpa memblokir UI. Bila offline, jawaban tetap ada di
    // perangkat ini dan akan terbawa saat tombol "Sinkronkan" ditekan admin.
    await syncKuesionerEntry(entry)

    return true
  }

  async getJawaban(mahasiswaId: string): Promise<JawabanKuesioner | null> {
    this.load()
    return this.mockJawaban.find((j) => j.mahasiswa_id === mahasiswaId) || null
  }

  /** Semua jawaban yang tersimpan — dipakai halaman laporan admin. */
  async getAll(): Promise<JawabanKuesioner[]> {
    this.load()
    return [...this.mockJawaban]
  }

  /** Hapus semua jawaban lokal. */
  async clearAll(): Promise<void> {
    this.mockJawaban = []
    this.save()
  }
}

export const kuesionerService = new KuesionerService()
export default kuesionerService
