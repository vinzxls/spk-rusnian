/**
 * Jembatan data mentah → input perhitungan AHP+VIKOR.
 *
 * Kuesioner disimpan per subkriteria (`C1_A1` .. `C5_A5`, skala 1–5), sedangkan
 * mesin VIKOR membutuhkan satu nilai per kriteria (`C1` .. `C5`). Nilai kriteria
 * di sini adalah rata-rata kelima subkriterianya.
 */
import type { JawabanKuesioner } from '../services/kuesioner.service'
import type { KuesionerJawaban, MahasiswaData } from '../types/hasil.types'
import type { MahasiswaQueryParams, MahasiswaWithUser } from '../types/mahasiswa.types'
import { mahasiswaService } from '../services/mahasiswa.service'

const KRITERIA_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const
const SUBKRITERIA_KEYS = ['A1', 'A2', 'A3', 'A4', 'A5'] as const

/** Rata-rata subkriteria per kriteria untuk satu responden. */
export function agregasiJawaban(jawaban: Record<string, number>): Record<string, number> {
  const hasil: Record<string, number> = {}

  for (const k of KRITERIA_KEYS) {
    const nilai = SUBKRITERIA_KEYS.map((s) => jawaban[`${k}_${s}`]).filter(
      (v): v is number => typeof v === 'number' && Number.isFinite(v)
    )
    hasil[k] = nilai.length ? nilai.reduce((a, b) => a + b, 0) / nilai.length : 0
  }

  return hasil
}

/** Ubah jawaban tersimpan menjadi format yang diterima hasil-identifikasi.service. */
export function toKuesionerJawaban(daftar: JawabanKuesioner[]): KuesionerJawaban[] {
  return daftar.map((j) => {
    const agg = agregasiJawaban(j.jawaban)
    return {
      mahasiswaId: j.mahasiswa_id,
      C1: agg.C1,
      C2: agg.C2,
      C3: agg.C3,
      C4: agg.C4,
      C5: agg.C5,
    }
  })
}

/**
 * Peta mahasiswa untuk pelabelan hasil. Kunci memakai `user_id` karena kuesioner
 * menyimpan id user yang login, bukan id tabel mahasiswa.
 */
export async function buildMahasiswaMap(params?: MahasiswaQueryParams): Promise<Record<string, MahasiswaData>> {
  const { data } = await mahasiswaService.findAll({ ...params, limit: 1000 })
  const map: Record<string, MahasiswaData> = {}

  for (const m of data as MahasiswaWithUser[]) {
    map[m.user_id] = {
      id: m.id,
      nim: m.nim,
      nama: m.nama,
      prodi: m.prodi,
      angkatan: m.angkatan,
    }
  }

  return map
}

export const kuesionerMapper = { agregasiJawaban, toKuesionerJawaban, buildMahasiswaMap }
export default kuesionerMapper
