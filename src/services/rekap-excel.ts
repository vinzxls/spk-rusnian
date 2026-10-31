/**
 * Susun isi berkas Excel dari hasil `buildRekap()`.
 *
 * Tiga sheet:
 *   1. "Rekap Kuesioner"  — satu baris per mahasiswa (status, skor, nilai C1–C5, S/R/Q)
 *   2. "Bobot AHP"        — bobot kriteria + uji konsistensi yang dipakai
 *   3. "Detail Jawaban"   — 25 jawaban mentah per responden (audit)
 */
import type { ExcelSheet } from '../utils/excel'
import { downloadXlsx } from '../utils/excel'
import { SUBKRITERIA_LIST, KRITERIA_LIST, type RekapResult } from '../services/rekap.service'
import { formatTanggal } from '../services/rekap.service'

const KRITERIA_LABEL: Record<string, string> = {
  C1: 'Durasi',
  C2: 'Frekuensi',
  C3: 'Ketergantungan',
  C4: 'Gangguan Akademik',
  C5: 'FoMO',
}

/** Sheet 1: satu baris per mahasiswa. */
export function sheetRekap(rekap: RekapResult): ExcelSheet {
  const header = [
    'No',
    'NIM',
    'Nama',
    'Prodi',
    'Angkatan',
    'Status',
    'Terjawab',
    'Total Skor',
    'Skor AHP',
    ...KRITERIA_LIST.map((k) => `${k} (${KRITERIA_LABEL[k]})`),
    'S',
    'R',
    'Q',
    'Rank',
    'Kategori',
    'Waktu Submit',
  ]

  const rows = rekap.rows.map((r, i) => [
    i + 1,
    r.nim,
    r.nama,
    r.prodi,
    r.angkatan,
    r.status,
    r.terjawab,
    r.status === 'Selesai' ? r.totalSkor : '-',
    r.status === 'Selesai' ? r.skorAHP : '-',
    ...KRITERIA_LIST.map((k) => (r.status === 'Selesai' ? r.nilai[k] : '-')),
    r.S ?? '-',
    r.R ?? '-',
    r.Q ?? '-',
    r.rank ?? '-',
    r.kategori ?? '-',
    formatTanggal(r.submittedAt),
  ])

  return {
    name: 'Rekap Kuesioner',
    rows: [header, ...rows],
    headerRow: true,
    columnWidths: [5, 16, 26, 18, 10, 10, 10, 12, 12, 14, 12, 18, 20, 10, 8, 10, 10, 8, 14, 20],
    decimalColumns: [8, ...KRITERIA_LIST.map((_, i) => 9 + i), 14, 15, 16],
  }
}

/** Sheet 2: bobot kriteria dan konsistensi. */
export function sheetBobot(rekap: RekapResult, konsistensi?: {
  lambdaMax: number
  CI: number
  RI: number
  CR: number
  isConsistent: boolean
}): ExcelSheet {
  const rows: (string | number)[][] = [
    ['Bobot Kriteria AHP'],
    ['Sumber bobot', rekap.bobotDariAHP ? 'Perbandingan berpasangan (disimpan admin)' : 'Setara (belum ada input AHP)'],
    ['Jumlah responden', rekap.jumlahResponden],
    [],
    ['Kode', 'Kriteria', 'Bobot', 'Persentase'],
    ...KRITERIA_LIST.map((k) => [
      k,
      KRITERIA_LABEL[k],
      rekap.bobot[k],
      `${(rekap.bobot[k] * 100).toFixed(2)}%`,
    ]),
    [
      'Total',
      '',
      rekap.bobot.C1 + rekap.bobot.C2 + rekap.bobot.C3 + rekap.bobot.C4 + rekap.bobot.C5,
      '100%',
    ],
  ]

  if (konsistensi) {
    rows.push(
      [],
      ['Uji Konsistensi'],
      ['Lambda max', konsistensi.lambdaMax],
      ['CI', konsistensi.CI],
      ['RI (n=5)', konsistensi.RI],
      ['CR', konsistensi.CR],
      ['Konsisten (CR < 0,1)', konsistensi.isConsistent ? 'Ya' : 'Tidak']
    )
  }

  if (rekap.catatan.length) {
    rows.push([], ['Catatan'])
    for (const c of rekap.catatan) rows.push([c])
  }

  return {
    name: 'Bobot AHP',
    rows,
    headerRow: false,
    columnWidths: [22, 26, 12, 14],
    decimalColumns: [2],
  }
}

/** Sheet 3: 25 jawaban mentah per responden. */
export function sheetDetail(rows: RekapResult['rows']): ExcelSheet {
  const pertanyaan = KRITERIA_LIST.flatMap((k) =>
    SUBKRITERIA_LIST.map((s) => `${k}_${s}`)
  )

  const header = ['NIM', 'Nama', ...pertanyaan, 'Total Skor']

  const data = rows
    .filter((r) => r.status === 'Selesai')
    .map((r) => [
      r.nim,
      r.nama,
      ...pertanyaan.map((p) => {
        const nilai = r.jawaban[p]
        return typeof nilai === 'number' ? nilai : '-'
      }),
      r.totalSkor,
    ])

  return {
    name: 'Detail Jawaban',
    rows: [header, ...data],
    headerRow: true,
    columnWidths: [16, 26, ...pertanyaan.map(() => 7), 12],
    decimalColumns: [],
  }
}

export interface ExportRekapOptions {
  konsistensi?: Parameters<typeof sheetBobot>[1]
  filename?: string
}

/** Unduh rekap sebagai satu berkas .xlsx berisi tiga sheet. */
export function exportRekapExcel(rekap: RekapResult, options: ExportRekapOptions = {}): string {
  const stamp = new Date().toISOString().slice(0, 10)
  const filename = options.filename ?? `rekap-kuesioner-${stamp}.xlsx`

  downloadXlsx(filename, [
    sheetRekap(rekap),
    sheetBobot(rekap, options.konsistensi),
    sheetDetail(rekap.rows),
  ])

  return filename
}

export const rekapExcel = { exportRekapExcel, sheetRekap, sheetBobot, sheetDetail }
export default rekapExcel
