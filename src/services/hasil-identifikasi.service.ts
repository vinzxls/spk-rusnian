/**
 * Hasil Identifikasi Service — Gabungan AHP + VIKOR
 * Sistem AHP+VIKOR Identifikasi Kecanduan Media Sosial
 *
 * Alur perhitungan:
 * 1. Terima bobot AHP (CriteriaWeight) hasil dari pairwise comparison
 * 2. Terima jawaban kuesioner mahasiswa (KuesionerJawaban[])
 * 3. Konversi ke AlternativeValue[] untuk VIKOR
 * 4. Hitung VIKOR → mendapatkan S, R, Q, ranking
 * 5. Tentukan kategori kecanduan berdasarkan Q
 * 6. Return HasilRanking lengkap
 */

import { computeVIKOR } from '../utils/vikor-calculator';
import {
  AlternativeValue,
  CriteriaWeight,
  DEFAULT_VIKORS_CONFIG,
  VikorsCalculation,
  VikorsConfig,
} from '../types/vikor.types';
import {
  DEFAULT_KATEGORI_KETERANGAN,
  HasilRanking,
  KuesionerJawaban,
  MahasiswaData,
  RankingEntry,
  tentukanKategoriKecanduan,
} from '../types/hasil.types';

export class HasilIdentifikasiValidationError extends Error {
  readonly code = 'HASIL_IDENTIFIKASI_VALIDATION_ERROR';
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'HasilIdentifikasiValidationError';
  }
}

const CRITERIA_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const;

export function validasiBobotAHP(weights: CriteriaWeight): void {
  for (const k of CRITERIA_KEYS) {
    const v = weights[k];
    if (!Number.isFinite(v) || v < 0 || v > 1) {
      throw new HasilIdentifikasiValidationError(`Bobot ${k} tidak valid`, { [k]: v });
    }
  }

  const total = weights.C1 + weights.C2 + weights.C3 + weights.C4 + weights.C5;
  if (Math.abs(total - 1.0) > 1e-4) {
    throw new HasilIdentifikasiValidationError('Total bobot AHP harus ≈ 1.0', {
      total,
      weights,
    });
  }
}

export function validasiJawabanKuesioner(jawaban: KuesionerJawaban[]): void {
  if (!Array.isArray(jawaban) || jawaban.length === 0) {
    throw new HasilIdentifikasiValidationError('Daftar jawaban kuesioner tidak boleh kosong');
  }

  for (let i = 0; i < jawaban.length; i++) {
    const j = jawaban[i];
    if (!j.mahasiswaId) {
      throw new HasilIdentifikasiValidationError(`Jawaban ke-${i} tidak memiliki mahasiswaId`);
    }
    for (const k of CRITERIA_KEYS) {
      const v = j[k];
      if (!Number.isFinite(v)) {
        throw new HasilIdentifikasiValidationError(`Nilai ${k} pada mahasiswaId ${j.mahasiswaId} tidak valid`, { v });
      }
    }
  }
}

export function konversiJawabanKeAlternatif(
  jawaban: KuesionerJawaban[],
  mahasiswaMap?: Record<string, MahasiswaData>
): AlternativeValue[] {
  return jawaban.map((j) => {
    const m = mahasiswaMap?.[j.mahasiswaId];
    const nama = m?.nama || m?.nim || `Mahasiswa ${j.mahasiswaId}`;
    return {
      alternativeId: j.mahasiswaId,
      alternativeName: nama,
      C1: j.C1,
      C2: j.C2,
      C3: j.C3,
      C4: j.C4,
      C5: j.C5,
    };
  });
}

export interface GabungAHPVIKORInput {
  bobotAHP: CriteriaWeight;
  jawabanKuesioner: KuesionerJawaban[];
  mahasiswaMap?: Record<string, MahasiswaData>;
  configVikor?: Partial<VikorsConfig>;
}

export function gabungAHPdanVIKOR(input: GabungAHPVIKORInput): HasilRanking {
  const { bobotAHP, jawabanKuesioner, mahasiswaMap, configVikor } = input;

  validasiBobotAHP(bobotAHP);
  validasiJawabanKuesioner(jawabanKuesioner);

  const alternatives = konversiJawabanKeAlternatif(jawabanKuesioner, mahasiswaMap);

  const config: VikorsConfig = {
    ...DEFAULT_VIKORS_CONFIG,
    ...configVikor,
  };

  const hasilVikor: VikorsCalculation = computeVIKOR(alternatives, bobotAHP, config);

  const ranking: RankingEntry[] = hasilVikor.results.map((r) => ({
    ...r,
    kategoriKecanduan: tentukanKategoriKecanduan(r.Q),
    mahasiswaData: mahasiswaMap?.[r.alternativeId],
  }));

  const keteranganKategori = DEFAULT_VIKORS_CONFIG.criteriaType ? undefined : undefined;
  return {
    bobotAHP,
    hasilVikor,
    ranking,
    keteranganKategori: DEFAULT_KATEGORI_KETERANGAN,
    computedAt: new Date().toISOString(),
  };
}

export const hasilIdentifikasiService = {
  validasiBobotAHP,
  validasiJawabanKuesioner,
  konversiJawabanKeAlternatif,
  gabungAHPdanVIKOR,
};

export default hasilIdentifikasiService;
