/**
 * Rekap pengerjaan kuesioner + hasil AHP/VIKOR per mahasiswa.
 *
 * Menyatukan tiga sumber data yang sebelumnya terpisah:
 *   1. daftar mahasiswa (user-store)
 *   2. jawaban kuesioner (kuesioner.service)
 *   3. bobot kriteria dari perbandingan berpasangan AHP (ahp-store)
 *
 * Keluaran utamanya dipakai halaman "Rekap Kuesioner" dan ekspor Excel.
 */
import { kuesionerService, type JawabanKuesioner } from './kuesioner.service'
import { mahasiswaService } from './mahasiswa.service'
import { getBobotAHP, hasBobotAHP } from './ahp-store'
import { gabungAHPdanVIKOR } from './hasil-identifikasi.service'
import { toKuesionerJawaban, buildMahasiswaMap, agregasiJawaban } from '../utils/kuesioner-mapper'
import { tentukanKategoriKecanduan, type KategoriKecanduan, type MahasiswaData } from '../types/hasil.types'
import type { CriteriaWeight } from '../types/vikor.types'
import type { MahasiswaWithUser } from '../types/mahasiswa.types'

export const KRITERIA_LIST = ['C1', 'C2', 'C3', 'C4', 'C5'] as const
export const SUBKRITERIA_LIST = ['A1', 'A2', 'A3', 'A4', 'A5'] as const

/** Jumlah pertanyaan kuesioner: 5 kriteria × 5 subkriteria. */
export const TOTAL_PERTANYAAN = KRITERIA_LIST.length * SUBKRITERIA_LIST.length

/** Skor minimum & maksimum kuesioner (25 pertanyaan, skala 1–5). */
export const SKOR_MIN = TOTAL_PERTANYAAN
export const SKOR_MAX = TOTAL_PERTANYAAN * 5

export type StatusPengisian = 'Selesai' | 'Belum'

export interface RekapRow {
  mahasiswaId: string
  userId: string
  nim: string
  nama: string
  prodi: string
  angkatan: number
  status: StatusPengisian
  /** Jumlah pertanyaan yang terjawab (0–25). */
  terjawab: number
  /** Total skor kuesioner: penjumlahan seluruh jawaban (25–125). */
  totalSkor: number
  /** Rata-rata skor kuesioner per kriteria (1–5). */
  nilai: Record<'C1' | 'C2' | 'C3' | 'C4' | 'C5', number>
  /** Skor AHP = Σ (bobot kriteria × nilai kriteria), rentang 1–5. */
  skorAHP: number
  /** Ukuran VIKOR. Kosong bila mahasiswa belum mengisi kuesioner. */
  S: number | null
  R: number | null
  Q: number | null
  rank: number | null
  kategori: KategoriKecanduan | null
  submittedAt: string | null
  /** Jawaban mentah `C1_A1`..`C5_A5`, kosong bila belum mengisi. */
  jawaban: Record<string, number>
}

export interface RekapResult {
  rows: RekapRow[]
  /** `true` bila bobot berasal dari perbandingan berpasangan yang disimpan admin. */
  bobotDariAHP: boolean
  bobot: CriteriaWeight
  /** Jumlah responden yang menjadi dasar perhitungan VIKOR. */
  jumlahResponden: number
  /** Peringatan yang perlu ditampilkan di UI (mis. Q belum stabil). */
  catatan: string[]
}

/** Ambil angka dari jawaban; `undefined` bila bukan bilangan. */
function angka(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** Rata-rata nilai per kriteria dari jawaban mentah. */
function nilaiPerKriteria(jawaban: Record<string, number>): RekapRow['nilai'] {
  const agg = agregasiJawaban(jawaban)
  return {
    C1: bulat(agg.C1 ?? 0),
    C2: bulat(agg.C2 ?? 0),
    C3: bulat(agg.C3 ?? 0),
    C4: bulat(agg.C4 ?? 0),
    C5: bulat(agg.C5 ?? 0),
  }
}

/** Bulatkan ke 6 desimal agar tidak muncul artefak float (mis. 3.9999999999999996). */
export function bulat(nilai: number, desimal = 6): number {
  const faktor = 10 ** desimal
  return Math.round(nilai * faktor) / faktor
}

function skorAHPdari(nilai: RekapRow['nilai'], bobot: CriteriaWeight): number {
  return bulat(
    bobot.C1 * nilai.C1 +
      bobot.C2 * nilai.C2 +
      bobot.C3 * nilai.C3 +
      bobot.C4 * nilai.C4 +
      bobot.C5 * nilai.C5
  )
}

/**
 * Bangun rekap lengkap untuk semua mahasiswa terdaftar.
 *
 * Mahasiswa yang belum mengisi tetap muncul dengan status "Belum" agar admin
 * bisa melihat siapa yang masih perlu ditagih.
 */
export async function buildRekap(): Promise<RekapResult> {
  const [{ data }, jawaban] = await Promise.all([
    mahasiswaService.findAll({ limit: 1000 }),
    kuesionerService.getAll(),
  ])

  const daftar = data as MahasiswaWithUser[]
  const bobot = getBobotAHP()

  // Kuesioner menyimpan id user yang login, bukan id tabel mahasiswa.
  const jawabanPerUser = new Map<string, JawabanKuesioner>()
  for (const j of jawaban) jawabanPerUser.set(j.mahasiswa_id, j)

  const catatan: string[] = []
  if (!hasBobotAHP()) {
    catatan.push(
      'Bobot kriteria masih setara (0,2 untuk setiap kriteria). Isi perbandingan berpasangan di halaman AHP agar skor memakai bobot sungguhan.'
    )
  }

  // Hitung VIKOR hanya untuk responden yang sudah mengisi.
  const responden = daftar.filter((m) => jawabanPerUser.has(m.user_id))
  let vikorPerUser = new Map<string, { S: number; R: number; Q: number; rank: number }>()

  if (responden.length > 0) {
    const mahasiswaMap = await buildMahasiswaMap()
    const hasil = gabungAHPdanVIKOR({
      bobotAHP: bobot,
      jawabanKuesioner: toKuesionerJawaban(responden.map((m) => jawabanPerUser.get(m.user_id)!)),
      mahasiswaMap,
    })

    vikorPerUser = new Map(
      hasil.ranking.map((r) => [r.alternativeId, { S: r.S, R: r.R, Q: r.Q, rank: r.rank }])
    )

    if (responden.length < 3) {
      catatan.push(
        `Nilai Q dan kategori baru bermakna bila responden ≥ 3 (sekarang ${responden.length}). Q adalah indeks relatif, bukan skor absolut.`
      )
    }
  }

  const rows: RekapRow[] = daftar.map((m) => {
    const j = jawabanPerUser.get(m.user_id)
    const nilai = nilaiPerKriteria(j?.jawaban ?? {})

    const terjawab = j
      ? KRITERIA_LIST.flatMap((k) => SUBKRITERIA_LIST.map((s) => angka(j.jawaban[`${k}_${s}`]))).filter(
          (v) => v !== undefined
        ).length
      : 0

    const totalSkor = j
      ? KRITERIA_LIST.flatMap((k) => SUBKRITERIA_LIST.map((s) => angka(j.jawaban[`${k}_${s}`]))).reduce<number>(
          (sum, v) => sum + (v ?? 0),
          0
        )
      : 0

    const skorAHP = j ? skorAHPdari(nilai, bobot) : 0
    const vikor = vikorPerUser.get(m.user_id)

    return {
      mahasiswaId: m.id,
      userId: m.user_id,
      nim: m.nim,
      nama: m.nama,
      prodi: m.prodi,
      angkatan: m.angkatan,
      status: j ? 'Selesai' : 'Belum',
      terjawab,
      totalSkor,
      nilai,
      skorAHP,
      S: vikor ? bulat(vikor.S) : null,
      R: vikor ? bulat(vikor.R) : null,
      Q: vikor ? bulat(vikor.Q) : null,
      rank: vikor?.rank ?? null,
      kategori: vikor ? tentukanKategoriKecanduan(vikor.Q) : null,
      submittedAt: j?.submitted_at ?? null,
      jawaban: j?.jawaban ?? {},
    }
  })

  rows.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Selesai' ? -1 : 1
    if (a.rank !== null && b.rank !== null) return a.rank - b.rank
    return a.nama.localeCompare(b.nama, 'id')
  })

  return {
    rows,
    bobotDariAHP: hasBobotAHP(),
    bobot,
    jumlahResponden: responden.length,
    catatan,
  }
}

/** Format tanggal ISO → teks Indonesia ringkas. */
export function formatTanggal(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Nama mahasiswa untuk pelabelan (dipakai bila data mahasiswa tidak ada). */
export function namaMahasiswa(m: MahasiswaData | undefined, fallback: string): string {
  return m?.nama || m?.nim || fallback
}

export const rekapService = { buildRekap, formatTanggal, TOTAL_PERTANYAAN, SKOR_MIN, SKOR_MAX }
export default rekapService
