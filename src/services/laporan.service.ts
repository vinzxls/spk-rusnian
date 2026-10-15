/**
 * Laporan Service — Generate laporan hasil identifikasi & ranking
 * Sistem AHP+VIKOR Identifikasi Kecanduan Media Sosial
 *
 * Output: konsep HTML untuk ekspor (bisa dikonversi ke PDF di frontend)
 */

import { HasilRanking, KategoriKecanduan, LaporanData, LaporanFilter } from '../types/hasil.types';

export class LaporanValidationError extends Error {
  readonly code = 'LAPORAN_VALIDATION_ERROR';
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'LaporanValidationError';
  }
}

export function hitungRingkasan(ranking: HasilRanking['ranking']) {
  const totalMahasiswa = ranking.length;
  let rendah = 0;
  let sedang = 0;
  let tinggi = 0;
  let sangatTinggi = 0;

  for (const r of ranking) {
    switch (r.kategoriKecanduan) {
      case 'Rendah':
        rendah++;
        break;
      case 'Sedang':
        sedang++;
        break;
      case 'Tinggi':
        tinggi++;
        break;
      case 'Sangat Tinggi':
        sangatTinggi++;
        break;
    }
  }

  return { totalMahasiswa, rendah, sedang, tinggi, sangatTinggi };
}

export function filterRanking(ranking: HasilRanking['ranking'], filter?: LaporanFilter) {
  if (!filter) return ranking;
  let hasil = [...ranking];

  if (filter.prodi) {
    hasil = hasil.filter((r) => r.mahasiswaData?.prodi === filter.prodi);
  }
  if (filter.angkatan !== undefined) {
    hasil = hasil.filter((r) => r.mahasiswaData?.angkatan === filter.angkatan);
  }
  if (filter.kategori) {
    hasil = hasil.filter((r) => r.kategoriKecanduan === filter.kategori);
  }

  return hasil;
}

export interface GenerateLaporanInput {
  hasilRanking: HasilRanking;
  filter?: LaporanFilter;
  dicetakOleh: string;
  header?: Partial<LaporanData['header']>;
  catatan?: string;
}

export function generateLaporanData(input: GenerateLaporanInput): LaporanData {
  const { hasilRanking, filter, dicetakOleh, header, catatan } = input;

  if (!dicetakOleh?.trim()) {
    throw new LaporanValidationError('dicetakOleh wajib diisi');
  }

  const filtered = filterRanking(hasilRanking.ranking, filter);
  const ringkasan = hitungRingkasan(filtered);

  const defaultHeader: LaporanData['header'] = {
    judul: 'LAPORAN HASIL IDENTIFIKASI KECANDUAN MEDIA SOSIAL',
    institusi: 'Universitas/Institusi',
    fakultas: 'Fakultas',
    programStudi: header?.programStudi || 'Program Studi',
    periode: filter?.periode
      ? `${filter.periode.tahunAwal || '-'} - ${filter.periode.tahunAkhir || '-'}`
      : 'Semua Periode',
    tanggalCetak: new Date().toLocaleDateString('id-ID'),
    dicetakOleh,
  };

  return {
    header: { ...defaultHeader, ...header },
    ringkasan,
    tabelRanking: filtered,
    bobotKriteria: hasilRanking.bobotAHP,
    catatan: catatan || 'Laporan ini dihasilkan berdasarkan perhitungan AHP+VIKOR.',
  };
}

export function generateLaporanHTML(data: LaporanData): string {
  const rows = data.tabelRanking
    .map(
      (r, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${r.mahasiswaData?.nim || r.alternativeId}</td>
      <td>${r.alternativeName}</td>
      <td>${r.mahasiswaData?.prodi || '-'}</td>
      <td>${r.mahasiswaData?.angkatan || '-'}</td>
      <td>${r.S.toFixed(6)}</td>
      <td>${r.R.toFixed(6)}</td>
      <td>${r.Q.toFixed(6)}</td>
      <td>${r.kategoriKecanduan}</td>
      <td>${r.rank}</td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${data.header.judul}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #333; padding: 8px; font-size: 12px; }
    th { background-color: #f2f2f2; }
    .ringkasan { margin-top: 20px; }
  </style>
</head>
<body>
  <h1>${data.header.judul}</h1>
  <h2>${data.header.institusi}</h2>
  <p><strong>Periode:</strong> ${data.header.periode}</p>
  <p><strong>Tanggal Cetak:</strong> ${data.header.tanggalCetak}</p>
  <p><strong>Dicetak Oleh:</strong> ${data.header.dicetakOleh}</p>

  <div class="ringkasan">
    <h3>Ringkasan Hasil</h3>
    <p>Total Mahasiswa: ${data.ringkasan.totalMahasiswa}</p>
    <p>Rendah: ${data.ringkasan.rendah} | Sedang: ${data.ringkasan.sedang} | Tinggi: ${data.ringkasan.tinggi} | Sangat Tinggi: ${data.ringkasan.sangatTinggi}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>NIM</th>
        <th>Nama</th>
        <th>Prodi</th>
        <th>Angkatan</th>
        <th>S</th>
        <th>R</th>
        <th>Q</th>
        <th>Kategori</th>
        <th>Peringkat</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <p style="margin-top: 30px;"><strong>Catatan:</strong> ${data.catatan}</p>
</body>
</html>
  `.trim();
}

export function generateLaporanPDFConcept(data: LaporanData): {
  html: string;
  metadata: {
    filename: string;
    title: string;
  };
} {
  const html = generateLaporanHTML(data);
  return {
    html,
    metadata: {
      filename: `laporan_kecanduan_medsos_${Date.now()}.html`,
      title: data.header.judul,
    },
  };
}

export const laporanService = {
  hitungRingkasan,
  filterRanking,
  generateLaporanData,
  generateLaporanHTML,
  generateLaporanPDFConcept,
};

export default laporanService;
