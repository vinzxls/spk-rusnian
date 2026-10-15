/**
 * AHP Service — Engine Analytical Hierarchy Process
 * Orchestration tipis di atas pure calculator; validasi di boundary, logika di utils.
 *
 * Contract:
 *   comparisons (PairwiseComparison, upper-triangle) → pairwiseMatrix 5×5
 *                                                → normalizedMatrix
 *                                                → weights [C1..C5]
 *                                                → consistency { λmax, CI, RI, CR, isConsistent }
 *                                                → AHPResult lengkap
 *
 * Pure math → src/utils/ahp-calculator.ts  |  Types → src/types/ahp.types.ts
 */

import {
  AHPConfig,
  AHPResult,
  ConsistencyTest,
  CriteriaWeight,
  NormalizedMatrix,
  PairwiseComparison,
  PairwiseMatrix,
  DEFAULT_AHP_CONFIG,
  isValidScaleSaaty,
} from '../types/ahp.types';

import {
  buildPairwiseMatrix as calcBuildMatrix,
  calculateConsistency as calcConsistency,
  calculateWeights as calcWeights,
  computeAHP as calcComputeAHP,
  getRI,
  normalizeMatrix as calcNormalize,
} from '../utils/ahp-calculator';

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

export class AHPValidationError extends Error {
  readonly code = 'AHP_VALIDATION_ERROR';
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'AHPValidationError';
  }
}

/* ------------------------------------------------------------------ */
/* Validation at boundary                                              */
/* ------------------------------------------------------------------ */

/** Kunci PairwiseComparison (10 pasangan untuk 5 kriteria). */
const COMPARISON_KEYS: (keyof PairwiseComparison)[] = [
  'C1_C2',
  'C1_C3',
  'C1_C4',
  'C1_C5',
  'C2_C3',
  'C2_C4',
  'C2_C5',
  'C3_C4',
  'C3_C5',
  'C4_C5',
];

/**
 * Validasi input comparisons sebelum masuk ke calculator.
 * Melempar AHPValidationError bila ada skala di luar Saaty atau nilai tidak finite.
 */
export function validateComparisons(input: PairwiseComparison): void {
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const key of COMPARISON_KEYS) {
    const value = input[key];

    if (value === undefined || value === null) {
      missing.push(key);
      continue;
    }

    if (!Number.isFinite(value) || value <= 0) {
      invalid.push(`${key}=${value} (harus > 0 dan finite)`);
      continue;
    }

    // Toleransi floating untuk reciprocal (1/3, 1/7, dst.)
    if (!isValidScaleSaaty(value)) {
      // Izinkan nilai numerik dalam rentang Saaty meski bukan literal exact
      // karena 1/3 === 0.333...; tetap valid bila berada di himpunan.
      const inRange = value >= 1 / 9 - 1e-9 && value <= 9 + 1e-9;
      if (!inRange) invalid.push(`${key}=${value} (di luar rentang Saaty 1/9..9)`);
    }
  }

  if (missing.length > 0) {
    throw new AHPValidationError('Perbandingan berpasangan tidak lengkap.', { missing });
  }

  if (invalid.length > 0) {
    throw new AHPValidationError('Nilai skala Saaty tidak valid.', { invalid });
  }
}

/**
 * Validasi matriks 5×5 secara struktural (dipakai untuk normalize/weights/consistency).
 */
export function validateMatrix(matrix: PairwiseMatrix, label = 'matrix'): void {
  if (!Array.isArray(matrix) || matrix.length !== 5) {
    throw new AHPValidationError(`${label} harus berukuran 5×5.`, { size: matrix?.length });
  }

  for (let i = 0; i < 5; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== 5) {
      throw new AHPValidationError(`${label}[${i}] harus memiliki 5 kolom.`);
    }
    for (let j = 0; j < 5; j++) {
      const value = matrix[i][j];
      if (!Number.isFinite(value) || value <= 0) {
        throw new AHPValidationError(`${label}[${i}][${j}] harus berupa bilangan positif finite.`, {
          value,
        });
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Engine — thin wrappers delegating to pure calculator                */
/* ------------------------------------------------------------------ */

/**
 * Susun matriks perbandingan berpasangan 5×5 dari input comparisons.
 * Diagonal = 1, lower-triangle = reciprocal upper-triangle.
 */
export function buildPairwiseMatrix(comparisons: PairwiseComparison): PairwiseMatrix {
  validateComparisons(comparisons);
  return calcBuildMatrix(comparisons);
}

/**
 * Normalisasi matriks: tiap elemen dibagi total kolomnya.
 */
export function normalizeMatrix(matrix: PairwiseMatrix): NormalizedMatrix {
  validateMatrix(matrix, 'pairwiseMatrix');
  return calcNormalize(matrix);
}

/**
 * Hitung bobot prioritas [C1..C5] (Σ = 1) dengan geometric mean.
 */
export function calculateWeights(matrix: PairwiseMatrix): CriteriaWeight {
  validateMatrix(matrix, 'pairwiseMatrix');
  return calcWeights(matrix);
}

/**
 * Uji konsistensi: CI = (λmax − n)/(n−1), CR = CI/RI, RI(5)=1.12.
 * Mengembalikan { CI, RI, CR, isConsistent } dengan threshold default 0.1.
 */
export function calculateConsistency(
  matrix: PairwiseMatrix,
  weights: CriteriaWeight,
  config: Partial<Pick<AHPConfig, 'n' | 'crThreshold'>> = {}
): ConsistencyTest {
  validateMatrix(matrix, 'pairwiseMatrix');

  const n = config.n ?? DEFAULT_AHP_CONFIG.n;
  const crThreshold = config.crThreshold ?? DEFAULT_AHP_CONFIG.crThreshold;

  if (!Number.isFinite(n) || n < 1 || n > 10) {
    throw new AHPValidationError('Konfigurasi n harus 1..10.', { n });
  }

  // CR undefined untuk n < 3 (RI=0); tetap kembalikan CR=0 dan isConsistent=true
  if (getRI(n) === 0) {
    return {
      lambdaMax: n,
      CI: 0,
      RI: 0,
      CR: 0,
      isConsistent: true,
      n,
    };
  }

  return calcConsistency(matrix, weights, n, crThreshold);
}

/**
 * Pipeline lengkap: comparisons → AHPResult.
 * Satu-satunya entry point yang dibutuhkan UI / VIKOR.
 */
export function computeAHP(
  comparisons: PairwiseComparison,
  config: Partial<AHPConfig> = {}
): AHPResult {
  validateComparisons(comparisons);

  const merged: AHPConfig = { ...DEFAULT_AHP_CONFIG, ...config };

  if (merged.n !== 5) {
    // Sistem Rusnian terkunci di 5 kriteria; n lain ditolak eksplisit
    // agar tidak menyamarkan kesalahan konfigurasi.
    throw new AHPValidationError('Sistem ini mensyaratkan n=5 (C1..C5).', { n: merged.n });
  }

  return calcComputeAHP(comparisons, merged);
}

/* ------------------------------------------------------------------ */
/* Service object — alternative import style                           */
/* ------------------------------------------------------------------ */

export const ahpService = {
  buildPairwiseMatrix,
  normalizeMatrix,
  calculateWeights,
  calculateConsistency,
  computeAHP,
  validateComparisons,
  validateMatrix,
  getRI,
};

export default ahpService;
