/**
 * AHP Pure Calculator Functions
 * Fungsi matematika murni untuk perhitungan AHP (testable, tanpa side-effect)
 * Metode approksimasi eigenvalue: Geometric Mean (baris) + normalisasi kolom
 *
 * Alur: comparisons → matriks 5x5 → normalisasi → bobot → λmax → CI → CR
 */

import {
  AHPConfig,
  AHPResult,
  ConsistencyTest,
  CriteriaWeight,
  NormalizedMatrix,
  PairwiseComparison,
  PairwiseMatrix,
  RI_TABLE,
  SAATY_LABELS,
  ScaleSaaty,
  DEFAULT_AHP_CONFIG,
} from '../types/ahp.types';

/** Kunci bobot dalam urutan C1..C5 (dipakai untuk konversi objek ↔ array) */
const WEIGHT_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const;
type WeightKey = (typeof WEIGHT_KEYS)[number];

/**
 * Susun matriks perbandingan berpasangan penuh 5x5 dari input upper-triangle.
 * matrix[i][j] = a_ij (i dibanding j); matrix[j][i] = 1/a_ij (reciprocal).
 * Diagonal selalu 1.
 */
export function buildPairwiseMatrix(comparisons: PairwiseComparison): PairwiseMatrix {
  const n = 5;
  const matrix: PairwiseMatrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) matrix[i][i] = 1;

  // pasangan kunci input → [baris, kolom] pada matriks (hanya upper triangle)
  const upperMap: Record<string, [number, number]> = {
    C1_C2: [0, 1],
    C1_C3: [0, 2],
    C1_C4: [0, 3],
    C1_C5: [0, 4],
    C2_C3: [1, 2],
    C2_C4: [1, 3],
    C2_C5: [1, 4],
    C3_C4: [2, 3],
    C3_C5: [2, 4],
    C4_C5: [3, 4],
  };

  for (const [key, [row, col]] of Object.entries(upperMap)) {
    const val = comparisons[key as keyof PairwiseComparison];
    if (val === undefined || val <= 0) continue;
    matrix[row][col] = val;
    matrix[col][row] = 1 / val;
  }

  return matrix;
}

/**
 * Normalisasi matriks: setiap elemen dibagi total kolomnya.
 * Kembalikan matriks baru (tanpa memodifikasi input).
 */
export function normalizeMatrix(matrix: PairwiseMatrix): NormalizedMatrix {
  const n = matrix.length;

  // Total tiap kolom
  const columnSums: number[] = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += matrix[i][j];
    columnSums[j] = sum;
  }

  // Bagi tiap elemen dengan total kolomnya
  const normalized: NormalizedMatrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      normalized[i][j] = columnSums[j] > 0 ? matrix[i][j] / columnSums[j] : 0;
    }
  }

  return normalized;
}

/**
 * Hitung bobot prioritas [C1..C5] via Geometric Mean tiap baris:
 *   gm_i = (∏_j a_ij)^(1/n), lalu w_i = gm_i / Σ gm.
 * Alternatif Row Sum Method tetap valid; geometric mean lebih umum untuk AHP.
 */
export function calculateWeights(matrix: PairwiseMatrix): CriteriaWeight {
  const n = matrix.length;

  const geometricMeans: number[] = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) product *= matrix[i][j];
    geometricMeans[i] = product > 0 ? Math.pow(product, 1 / n) : 0;
  }

  const total = geometricMeans.reduce((sum, val) => sum + val, 0);
  const values = geometricMeans.map((val) => (total > 0 ? val / total : 0));

  return makeCriteriaWeight(values);
}

/**
 * Aproksimasi λmax: rata-rata rasio (A·w)_i / w_i.
 * Untuk matriks konsisten sempurna, hasilnya = n.
 */
export function calculateLambdaMax(matrix: PairwiseMatrix, weights: CriteriaWeight): number {
  const n = matrix.length;
  const w = weightsToArray(weights);

  const ratios: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let aw = 0;
    for (let j = 0; j < n; j++) aw += matrix[i][j] * w[j];
    ratios[i] = w[i] > 0 ? aw / w[i] : 0;
  }

  return ratios.reduce((sum, val) => sum + val, 0) / n;
}

/**
 * Uji konsistensi:
 *   CI = (λmax − n) / (n − 1)
 *   CR = CI / RI, RI(5) = 1.12
 *   konsisten bila CR < 0.1 (threshold Saaty)
 */
export function calculateConsistency(
  matrix: PairwiseMatrix,
  weights: CriteriaWeight,
  n: number = DEFAULT_AHP_CONFIG.n,
  crThreshold: number = DEFAULT_AHP_CONFIG.crThreshold
): ConsistencyTest {
  const lambdaMax = calculateLambdaMax(matrix, weights);
  const CI = (lambdaMax - n) / (n - 1);

  const RI = getRI(n);
  const CR = RI > 0 ? CI / RI : 0;

  return {
    lambdaMax: round6(lambdaMax),
    CI: round6(CI),
    RI,
    CR: round6(CR),
    isConsistent: CR < crThreshold,
    n,
  };
}

/**
 * Random Index standar Saaty (n = 1..10). n=5 → RI=1.12.
 */
export function getRI(n: number = DEFAULT_AHP_CONFIG.n): number {
  return RI_TABLE[n] ?? RI_TABLE[DEFAULT_AHP_CONFIG.n];
}

/**
 * Pipeline utama: dari input perbandingan sampai AHPResult lengkap.
 * Murni (tanpa I/O); timestamp computedAt dari jam sistem.
 */
export function computeAHP(
  comparisons: PairwiseComparison,
  config: Partial<AHPConfig> = {}
): AHPResult {
  const { n, crThreshold, decimalPlaces } = { ...DEFAULT_AHP_CONFIG, ...config };

  const pairwiseMatrix = buildPairwiseMatrix(comparisons);
  const normalizedMatrix = normalizeMatrix(pairwiseMatrix);
  const rawWeights = calculateWeights(pairwiseMatrix);
  const consistency = calculateConsistency(pairwiseMatrix, rawWeights, n, crThreshold);

  const weights = makeCriteriaWeight(
    weightsToArray(rawWeights).map((value) => roundTo(value, decimalPlaces))
  );

  return {
    pairwiseMatrix,
    normalizedMatrix,
    weights,
    consistency: {
      ...consistency,
      CI: roundTo(consistency.CI, decimalPlaces),
      CR: roundTo(consistency.CR, decimalPlaces),
    },
    computedAt: new Date().toISOString(),
    inputComparisons: comparisons,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers murni                                                       */
/* ------------------------------------------------------------------ */

/** Buat CriteriaWeight dari array [C1..C5] lengkap dengan toArray() */
export function makeCriteriaWeight(values: number[]): CriteriaWeight {
  const weight: CriteriaWeight = {
    C1: values[0] ?? 0,
    C2: values[1] ?? 0,
    C3: values[2] ?? 0,
    C4: values[3] ?? 0,
    C5: values[4] ?? 0,
    toArray: () => [weight.C1, weight.C2, weight.C3, weight.C4, weight.C5],
  };
  return weight;
}

/** Konversi CriteriaWeight → array number [C1, C2, C3, C4, C5] */
export function weightsToArray(weights: CriteriaWeight): number[] {
  return WEIGHT_KEYS.map((key) => weights[key]);
}

/** Validasi: Σ bobot ≈ 1 dengan toleransi epsilon */
export function verifyWeightsSum(weights: CriteriaWeight, epsilon: number = 0.001): boolean {
  const sum = weightsToArray(weights).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 1) < epsilon;
}

/** Label skala Saaty (1 = sama penting, 9 = mutlak lebih penting, dst.) */
export function getSaatyLabel(value: ScaleSaaty): string {
  return SAATY_LABELS[value] ?? String(value);
}

/** Pembulatan ke 6 desimal (presisi internal konsistensi) */
function round6(value: number): number {
  return Number(value.toFixed(6));
}

/** Pembulatan ke `places` desimal (default 6, wajar 4–6) */
function roundTo(value: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}