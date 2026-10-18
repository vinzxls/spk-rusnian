export interface JawabanKuesioner {
  id: string
  mahasiswa_id: string
  jawaban: Record<string, number> // Map subkriteria ID/Kode ke nilai 1-5
  submitted_at: string
}

class KuesionerService {
  private mockJawaban: JawabanKuesioner[] = []

  async getStatus(mahasiswaId: string): Promise<boolean> {
    return this.mockJawaban.some((j) => j.mahasiswa_id === mahasiswaId)
  }

  async submit(mahasiswaId: string, jawaban: Record<string, number>): Promise<boolean> {
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

    return true
  }

  async getJawaban(mahasiswaId: string): Promise<JawabanKuesioner | null> {
    return this.mockJawaban.find((j) => j.mahasiswa_id === mahasiswaId) || null
  }
}

export const kuesionerService = new KuesionerService()
