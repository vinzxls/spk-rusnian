/**
 * AHP (Analytical Hierarchy Process) Type Definitions
 * Sistem AHP+VIKOR untuk Identifikasi Kecanduan Media Sosial
 * Kriteria: C1=Durasi, C2=Frekuensi, C3=Ketergantungan, C4=Gangguan Akademik, C5=FoMO
 */

// Skala Saaty 1-9 dan reciprocal (1/9 - 9)
// TypeScript tidak mendukung fraction literal (1/9) di union type, gunakan nilai numerik asli
export type ScaleSaaty =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 0.1111111111111111  // 1/9
  | 0.125               // 1/8
  | 0.14285714285714285 // 1/7
  | 0.16666666666666666 // 1/6
  | 0.2                 // 1/5
  | 0.25                // 1/4
  | 0.3333333333333333  // 1/3
  | 0.5;                // 1/2

export const SAATY_SCALE: ScaleSaaty[] = [
  0.1111111111111111, 0.125, 0.14285714285714285, 0.16666666666666666,
  0.2, 0.25, 0.3333333333333333, 0.5,
  1,
  2, 3, 4, 5, 6, 7, 8, 9
];

// Label map menggunakan string key agar aman di TS
export const SAATY_LABELS: Record<string, string> = {
  '0.1111111111111111': '1/9 (Mutlak kurang penting)',
  '0.125': '1/8',
  '0.14285714285714285': '1/7 (Sangat kurang penting)',
  '0.16666666666666666': '1/6',
  '0.2': '1/5 (Kurang penting)',
  '0.25': '1/4',
  '0.3333333333333333': '1/3 (Sedikit kurang penting)',
  '0.5': '1/2',
  '1': '1 (Sama penting)',
  '2': '2',
  '3': '3 (Sedikit lebih penting)',
  '4': '4',
  '5': '5 (Lebih penting)',
  '6': '6',
  '7': '7 (Sangat lebih penting)',
  '8': '8',
  '9': '9 (Mutlak lebih penting)',
};

export type CriteriaCode = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export interface CriteriaInfo {
  code: CriteriaCode;
  name: string;
  description: string;
}

export const CRITERIA_LIST: CriteriaInfo[] = [
  { code: 'C1', name: 'Durasi', description: 'Lama penggunaan media sosial per hari' },
  { code: 'C2', name: 'Frekuensi', description: 'Seberapa sering membuka/cek media sosial' },
  { code: 'C3', name: 'Ketergantungan', description: 'Tingkat ketergantungan psikologis' },
  { code: 'C4', name: 'Gangguan Akademik', description: 'Dampak negatif pada performa akademik' },
  { code: 'C5', name: 'FoMO', description: 'Fear of Missing Out / kecemasan ketinggalan info' },
];

export type PairwiseMatrix = number[][];
export type NormalizedMatrix = number[][];

export interface CriteriaWeight {
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
  toArray(): number[];
}

export interface ConsistencyTest {
  lambdaMax: number;
  CI: number;
  RI: number;
  CR: number;
  isConsistent: boolean;
  n: number;
}

export interface PairwiseComparison {
  C1_C2: ScaleSaaty;
  C1_C3: ScaleSaaty;
  C1_C4: ScaleSaaty;
  C1_C5: ScaleSaaty;
  C2_C3: ScaleSaaty;
  C2_C4: ScaleSaaty;
  C2_C5: ScaleSaaty;
  C3_C4: ScaleSaaty;
  C3_C5: ScaleSaaty;
  C4_C5: ScaleSaaty;
}

export interface AHPResult {
  pairwiseMatrix: PairwiseMatrix;
  normalizedMatrix: NormalizedMatrix;
  weights: CriteriaWeight;
  consistency: ConsistencyTest;
  computedAt: string;
  inputComparisons: PairwiseComparison;
}

export interface AHPConfig {
  n: number;
  crThreshold: number;
  decimalPlaces: number;
}

export const RI_TABLE: Record<number, number> = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

export const DEFAULT_AHP_CONFIG: AHPConfig = {
  n: 5,
  crThreshold: 0.1,
  decimalPlaces: 6,
};

export function isValidScaleSaaty(value: number): boolean {
  return SAATY_SCALE.some(v => Math.abs(v - value) < 1e-9);
}

export function roundToDecimalPlaces(value: number, places: number = 6): number {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}