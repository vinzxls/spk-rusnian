/**
 * Types untuk Hasil Identifikasi, Ranking, dan Laporan
 * Sistem AHP+VIKOR Identifikasi Kecanduan Media Sosial
 *
 * Menggabungkan hasil AHP (bobot kriteria) + jawaban kuesioner mahasiswa
 * menjadi alternatif untuk dihitung dengan metode VIKOR
 */

import { CriteriaWeight } from './vikor.types';
import { VikorsCalculation, VikorsResult, AlternativeValue } from './vikor.types';

export type KategoriKecanduan = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';

export interface MahasiswaData {
  id: string; // UUID mahasiswa
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
}

export interface KuesionerJawaban {
  mahasiswaId: string;
  C1: number; // Durasi
  C2: number; // Frekuensi
  C3: number; // Ketergantungan
  C4: number; // Gangguan Akademik
  C5: number; // FoMO
}

export interface HasilIdentifikasi {
  id: string;
  mahasiswa: MahasiswaData;
  kuesionerJawaban: KuesionerJawaban;
  alternativeValue: AlternativeValue;
  kategoriKecanduan: KategoriKecanduan;
  skorQ: number; // Nilai Q VIKOR
  peringkat: number; // Ranking berdasarkan Q
  computedAt: string; // ISO timestamp
}

export interface RankingEntry extends VikorsResult {
  kategoriKecanduan: KategoriKecanduan;
  mahasiswaData?: MahasiswaData;
}

export interface HasilRanking {
  bobotAHP: CriteriaWeight;
  hasilVikor: VikorsCalculation;
  ranking: RankingEntry[];
  keteranganKategori: KategoriKeterangan[];
  computedAt: string;
}

export interface KategoriKeterangan {
  kategori: KategoriKecanduan;
  minQ: number;
  maxQ: number;
  keterangan: string;
  warna: string;
}

export interface LaporanFilter {
  periode?: {
    tahunAwal?: number;
    tahunAkhir?: number;
  };
  prodi?: string;
  angkatan?: number;
  kategori?: KategoriKecanduan;
}

export interface LaporanData {
  header: {
    judul: string;
    institusi: string;
    fakultas?: string;
    programStudi?: string;
    periode: string;
    tanggalCetak: string;
    dicetakOleh: string;
  };
  ringkasan: {
    totalMahasiswa: number;
    rendah: number;
    sedang: number;
    tinggi: number;
    sangatTinggi: number;
  };
  tabelRanking: RankingEntry[];
  bobotKriteria: CriteriaWeight;
  catatan: string;
}

export interface LaporanPDFConfig {
  format: 'a4' | 'a3';
  orientation: 'portrait' | 'landscape';
  includeKeterangan: boolean;
  includeGrafik: boolean;
  includeTandaTangan: boolean;
}

export const DEFAULT_KATEGORI_KETERANGAN: KategoriKeterangan[] = [
  {
    kategori: 'Rendah',
    minQ: 0.0,
    maxQ: 0.25,
    keterangan: 'Tingkat kecanduan media sosial rendah. Masih dalam batas normal.',
    warna: '#4ade80',
  },
  {
    kategori: 'Sedang',
    minQ: 0.25,
    maxQ: 0.5,
    keterangan: 'Tingkat kecanduan media sosial sedang. Perlu perhatian dan pengelolaan waktu.',
    warna: '#facc15',
  },
  {
    kategori: 'Tinggi',
    minQ: 0.5,
    maxQ: 0.75,
    keterangan: 'Tingkat kecanduan media sosial tinggi. Sangat perlu intervensi dan pembatasan.',
    warna: '#fb923c',
  },
  {
    kategori: 'Sangat Tinggi',
    minQ: 0.75,
    maxQ: 1.0,
    keterangan: 'Tingkat kecanduan media sosial sangat tinggi. Membutuhkan intervensi serius dari berbagai pihak.',
    warna: '#f87171',
  },
];

export function tentukanKategoriKecanduan(Q: number): KategoriKecanduan {
  if (Q <= 0.25) return 'Rendah';
  if (Q <= 0.5) return 'Sedang';
  if (Q <= 0.75) return 'Tinggi';
  return 'Sangat Tinggi';
}
