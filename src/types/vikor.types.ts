/**
 * VIKOR Types — Sistem AHP+VIKOR Identifikasi Kecanduan Medsos
 * Digunakan untuk perangkingan alternatif (mahasiswa) berdasarkan bobot AHP
 */

export type CriteriaCode = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export interface CriteriaWeight {
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
  toArray(): number[];
}

export interface AlternativeValue {
  alternativeId: string; // ID kuesioner/mahasiswa
  alternativeName: string; // Nama mahasiswa/NIM
  C1: number; // Durasi
  C2: number; // Frekuensi
  C3: number; // Ketergantungan
  C4: number; // Gangguan Akademik
  C5: number; // FoMO
}

export interface IdealSolution {
  fStar: number[]; // f_j* = nilai terbaik per kriteria
  fMinus: number[]; // f_j^- = nilai terburuk per kriteria
  isBenefit: boolean[]; // true jika benefit, false jika cost
}

export interface VikorsResult {
  alternativeId: string;
  alternativeName: string;
  S: number; // Utility measure
  R: number; // Regret measure
  Q: number; // VIKOR index
  rank: number;
  originalValues: AlternativeValue;
}

export interface VikorsCalculation {
  results: VikorsResult[];
  idealSolution: IdealSolution;
  weights: CriteriaWeight;
  v: number; // weight of strategy (default 0.5)
  computedAt: string;
}

export interface VikorsConfig {
  v: number; // 0 ≤ v ≤ 1 (0.5 = consensus)
  decimalPlaces: number;
  criteriaType: CriteriaType[];
}

export interface CriteriaType {
  code: CriteriaCode;
  isBenefit: boolean; // true = semakin tinggi semakin baik, false = semakin rendah semakin baik
}

export const DEFAULT_VIKORS_CONFIG: VikorsConfig = {
  v: 0.5,
  decimalPlaces: 6,
  criteriaType: [
    { code: 'C1', isBenefit: false }, // Durasi - idealnya rendah (cost)
    { code: 'C2', isBenefit: false }, // Frekuensi - idealnya rendah (cost)
    { code: 'C3', isBenefit: false }, // Ketergantungan - idealnya rendah (cost)
    { code: 'C4', isBenefit: false }, // Gangguan Akademik - idealnya rendah (cost)
    { code: 'C5', isBenefit: false }, // FoMO - idealnya rendah (cost)
  ],
};

export function roundToDecimalPlaces(v: number, p = 6): number {
  const f = Math.pow(10, p);
  return Math.round(v * f) / f;
}
