/**
 * Penyimpanan hasil perbandingan berpasangan AHP.
 *
 * Sebelumnya bobot kriteria hanya hidup di state komponen PairwiseMatrixForm,
 * jadi laporan dan perangkingan terpaksa memakai bobot setara [0.2 × 5].
 * Sekarang hasil input admin disimpan di localStorage, sehingga bobot yang
 * dipakai semua halaman adalah bobot yang benar-benar dihitung dari AHP.
 */
import type { CriteriaWeight, PairwiseComparison, ScaleSaaty } from '../types/ahp.types'
import { computeAHP } from '../utils/ahp-calculator'
import { makeCriteriaWeight } from '../utils/ahp-calculator'
import { triggerSync } from './sync.service'
import { pushCollection } from './api.service'

const AHP_KEY = 'rusnian.ahp'

/** Semua pasangan bernilai 1 = semua kriteria dianggap sama penting. */
export const DEFAULT_COMPARISONS: PairwiseComparison = {
  C1_C2: 1,
  C1_C3: 1,
  C1_C4: 1,
  C1_C5: 1,
  C2_C3: 1,
  C2_C4: 1,
  C2_C5: 1,
  C3_C4: 1,
  C3_C5: 1,
  C4_C5: 1,
}

export interface AhpState {
  comparisons: PairwiseComparison
  /** Bobot hasil perhitungan, disimpan agar bisa dibaca tanpa menghitung ulang. */
  weights: CriteriaWeight
  /** Ringkasan uji konsistensi saat disimpan. */
  consistency: {
    lambdaMax: number
    CI: number
    RI: number
    CR: number
    isConsistent: boolean
    n: number
  }
  savedAt: string
}

/** Bobot setara dipakai bila admin belum pernah mengisi perbandingan. */
export const BOBOT_SETARA: CriteriaWeight = makeCriteriaWeight([0.2, 0.2, 0.2, 0.2, 0.2])

const CRITERIA_KEYS = ['C1_C2', 'C1_C3', 'C1_C4', 'C1_C5', 'C2_C3', 'C2_C4', 'C2_C5', 'C3_C4', 'C3_C5', 'C4_C5'] as const

function isBrowser(): boolean {
  return typeof localStorage !== 'undefined'
}

/** Serialisasi: `toArray` adalah fungsi, tidak ikut tersimpan di JSON. */
function toPlain(state: AhpState) {
  return {
    comparisons: state.comparisons,
    weights: {
      C1: state.weights.C1,
      C2: state.weights.C2,
      C3: state.weights.C3,
      C4: state.weights.C4,
      C5: state.weights.C5,
    },
    consistency: state.consistency,
    savedAt: state.savedAt,
  }
}

/** Validasi bentuk data tersimpan; kembalikan null bila rusak/tidak lengkap. */
function parse(raw: unknown): AhpState | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as {
    comparisons?: Record<string, unknown>
    consistency?: AhpState['consistency']
    savedAt?: string
  }
  if (!data.comparisons) return null

  const comparisons = { ...DEFAULT_COMPARISONS }
  for (const key of CRITERIA_KEYS) {
    const nilai = Number(data.comparisons[key])
    if (!Number.isFinite(nilai) || nilai <= 0) return null
    comparisons[key] = nilai as ScaleSaaty
  }

  const hasil = computeAHP(comparisons)

  return {
    comparisons,
    weights: hasil.weights,
    consistency: data.consistency ?? hasil.consistency,
    savedAt: data.savedAt ?? new Date().toISOString(),
  }
}

export function loadAhp(): AhpState | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(AHP_KEY)
    if (!raw) return null
    return parse(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveAhp(comparisons: PairwiseComparison): AhpState {
  // Hitung ulang dari input agar bobot tersimpan selalu konsisten dengan matriks.
  const hasil = computeAHP(comparisons)
  const state: AhpState = {
    comparisons: hasil.inputComparisons,
    weights: hasil.weights,
    consistency: hasil.consistency,
    savedAt: new Date().toISOString(),
  }

  if (isBrowser()) {
    try {
      localStorage.setItem(AHP_KEY, JSON.stringify(toPlain(state)))
    } catch {
      /* storage penuh/diblokir — bobot tetap hidup di memori tab ini */
    }
  }

  // Bagikan bobot ke server agar semua perangkat memakai bobot yang sama.
  triggerSync('ahp')

  return state
}

export function resetAhp(): void {
  if (isBrowser()) {
    try {
      localStorage.removeItem(AHP_KEY)
    } catch {
      /* abaikan */
    }
  }
  // Kosongkan juga di server agar perangkat lain tidak masih memakai bobot lama.
  void pushCollection('ahp', null)
}

/** Bobot yang dipakai perhitungan: bobot tersimpan, atau bobot setara. */
export function getBobotAHP(): CriteriaWeight {
  return loadAhp()?.weights ?? BOBOT_SETARA
}

/** True bila admin sudah menyimpan perbandingan (bukan bobot setara). */
export function hasBobotAHP(): boolean {
  return loadAhp() !== null
}

/** Teks ringkas bobot untuk ditampilkan di UI/laporan. */
export function ringkasBobot(weights: CriteriaWeight): string {
  return CRITERIA_KEYS.slice(0, 5)
    .map((pair) => pair.split('_')[0])
    .map((k) => {
      const v = weights[k as keyof CriteriaWeight]
      return `${k} ${typeof v === 'number' ? v.toFixed(4) : '-'}`
    })
    .join(' · ')
}

export const ahpStore = {
  loadAhp,
  saveAhp,
  resetAhp,
  getBobotAHP,
  hasBobotAHP,
  ringkasBobot,
  DEFAULT_COMPARISONS,
  BOBOT_SETARA,
}

export default ahpStore
