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
    if (this.isBrowser()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) this.mockJawaban = JSON.parse(raw) as JawabanKuesioner[]
      } catch {
        // corrupt storage — start clean
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
      /* quota full — give up silently */
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
    return true
  }

  async getJawaban(mahasiswaId: string): Promise<JawabanKuesioner | null> {
    this.load()
    return this.mockJawaban.find((j) => j.mahasiswa_id === mahasiswaId) || null
  }

  /** Clear all stored answers — useful for testing */
  async clearAll(): Promise<void> {
    this.mockJawaban = []
    this.save()
  }
}

export const kuesionerService = new KuesionerService()
