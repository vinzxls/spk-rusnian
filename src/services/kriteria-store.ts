/**
 * Penyimpanan master data Kriteria & Subkriteria.
 *
 * Sebelumnya daftar kriteria hanya berupa konstanta (CRITERIA_LIST) sehingga
 * tombol "Kelola Kriteria"/"Kelola Subkriteria" tidak punya apa pun untuk
 * dikelola. Modul ini menyimpan perubahan ke localStorage supaya hasil edit
 * tetap ada setelah halaman di-refresh.
 *
 * Di produksi, modul ini yang diganti pemanggilan API backend.
 */
import { CRITERIA_LIST } from '../types/ahp.types'

const KRITERIA_KEY = 'rusnian.kriteria'
const SUBKRITERIA_KEY = 'rusnian.subkriteria'

export interface KriteriaItem {
  /** Kode kriteria, mis. "C1". */
  code: string
  name: string
  description: string
}

export interface SubkriteriaItem {
  /** Kode subkriteria, mis. "A1". */
  code: string
  label: string
  /** Nilai skala penelitian (1–5). */
  nilai: number
}

/** Data awal kriteria — diambil dari definisi tipe AHP agar tidak duplikat. */
export const DEFAULT_KRITERIA: KriteriaItem[] = CRITERIA_LIST.map((c) => ({
  code: c.code,
  name: c.name,
  description: c.description,
}))

/** Data awal subkriteria: skala 1–5 yang berlaku untuk setiap kriteria. */
export const DEFAULT_SUBKRITERIA: SubkriteriaItem[] = [
  { code: 'A1', label: 'Sangat Rendah', nilai: 1 },
  { code: 'A2', label: 'Rendah', nilai: 2 },
  { code: 'A3', label: 'Sedang', nilai: 3 },
  { code: 'A4', label: 'Tinggi', nilai: 4 },
  { code: 'A5', label: 'Sangat Tinggi', nilai: 5 },
]

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
    /* storage penuh/diblokir — data tetap hidup di memori tab ini */
  }
}

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }))

export function loadKriteria(): KriteriaItem[] {
  const tersimpan = read<KriteriaItem[]>(KRITERIA_KEY)
  if (!Array.isArray(tersimpan) || tersimpan.length === 0) return clone(DEFAULT_KRITERIA)
  return tersimpan
}

export function saveKriteria(items: KriteriaItem[]): void {
  write(KRITERIA_KEY, clampKriteria(items))
}

export function resetKriteria(): KriteriaItem[] {
  if (isBrowser()) {
    try {
      localStorage.removeItem(KRITERIA_KEY)
    } catch {
      /* abaikan */
    }
  }
  return clone(DEFAULT_KRITERIA)
}

export function loadSubkriteria(): SubkriteriaItem[] {
  const tersimpan = read<SubkriteriaItem[]>(SUBKRITERIA_KEY)
  if (!Array.isArray(tersimpan) || tersimpan.length === 0) return clone(DEFAULT_SUBKRITERIA)
  return tersimpan
}

export function saveSubkriteria(items: SubkriteriaItem[]): void {
  write(SUBKRITERIA_KEY, clampSubkriteria(items))
}

export function resetSubkriteria(): SubkriteriaItem[] {
  if (isBrowser()) {
    try {
      localStorage.removeItem(SUBKRITERIA_KEY)
    } catch {
      /* abaikan */
    }
  }
  return clone(DEFAULT_SUBKRITERIA)
}

/* ------------------------------------------------------------------ */
/* Normalisasi & validasi                                              */
/* ------------------------------------------------------------------ */

/** Bersihkan input sebelum disimpan: trim, buang entri kosong, urutkan kode. */
export function clampKriteria(items: KriteriaItem[]): KriteriaItem[] {
  return items
    .map((item) => ({
      code: item.code.trim().toUpperCase(),
      name: item.name.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.code !== '' && item.name !== '')
    .sort((a, b) => a.code.localeCompare(b.code, 'id', { numeric: true }))
}

export function clampSubkriteria(items: SubkriteriaItem[]): SubkriteriaItem[] {
  return items
    .map((item) => ({
      code: item.code.trim().toUpperCase(),
      label: item.label.trim(),
      nilai: Math.min(5, Math.max(1, Math.round(item.nilai))),
    }))
    .filter((item) => item.code !== '' && item.label !== '')
    .sort((a, b) => a.code.localeCompare(b.code, 'id', { numeric: true }))
}

/** Kode kriteria berikutnya: C1, C2, ... mengikuti angka terbesar yang ada. */
export function nextKriteriaCode(items: KriteriaItem[]): string {
  const terbesar = items.reduce((max, item) => {
    const angka = Number(item.code.replace(/[^0-9]/g, ''))
    return Number.isFinite(angka) && angka > max ? angka : max
  }, 0)
  return `C${terbesar + 1}`
}

export interface ValidationResult {
  ok: boolean
  error?: string
}

export function validateKriteria(items: KriteriaItem[]): ValidationResult {
  if (items.length === 0) return { ok: false, error: 'Minimal harus ada satu kriteria.' }

  const kode = new Set<string>()
  for (const item of items) {
    if (!item.code.trim()) return { ok: false, error: 'Kode kriteria tidak boleh kosong.' }
    if (!item.name.trim()) return { ok: false, error: `Nama kriteria ${item.code} belum diisi.` }
    const kunci = item.code.trim().toUpperCase()
    if (kode.has(kunci)) return { ok: false, error: `Kode kriteria ${kunci} dipakai lebih dari sekali.` }
    kode.add(kunci)
  }
  return { ok: true }
}

export function validateSubkriteria(items: SubkriteriaItem[]): ValidationResult {
  if (items.length === 0) return { ok: false, error: 'Minimal harus ada satu subkriteria.' }

  const kode = new Set<string>()
  for (const item of items) {
    if (!item.code.trim()) return { ok: false, error: 'Kode subkriteria tidak boleh kosong.' }
    if (!item.label.trim()) return { ok: false, error: `Label ${item.code} belum diisi.` }
    if (!Number.isInteger(item.nilai) || item.nilai < 1 || item.nilai > 5) {
      return { ok: false, error: `Nilai skala ${item.code} harus bilangan bulat 1–5.` }
    }
    const kunci = item.code.trim().toUpperCase()
    if (kode.has(kunci)) return { ok: false, error: `Kode subkriteria ${kunci} dipakai lebih dari sekali.` }
    kode.add(kunci)
  }
  return { ok: true }
}

export const kriteriaStore = {
  loadKriteria,
  saveKriteria,
  resetKriteria,
  loadSubkriteria,
  saveSubkriteria,
  resetSubkriteria,
  nextKriteriaCode,
  validateKriteria,
  validateSubkriteria,
  DEFAULT_KRITERIA,
  DEFAULT_SUBKRITERIA,
}

export default kriteriaStore
