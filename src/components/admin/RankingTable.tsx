/**
 * RankingTable.tsx
 * Komponen tabel ranking mahasiswa berdasarkan nilai Q (VIKOR)
 * Sistem AHP+VIKOR Identifikasi Kecanduan Media Sosial — Fitur Admin
 *
 * Fitur:
 *   • Tabel ranking: Peringkat, NIM, Nama, Prodi, Angkatan, C1..C5, S, R, Q, Kategori
 *   • Q terkecil = rank 1 (paling rendah kecanduannya menurut konvensi VIKOR cost)
 *   • Badge kategori berwarna: Rendah / Sedang / Tinggi / Sangat Tinggi
 *   • Search (nama/NIM), filter kategori, sortir kolom Q/S/R
 *   • Props ringan: terima RankingEntry[] langsung dari HasilRanking.ranking
 */

import { useMemo, useState } from 'react';
import type { KategoriKecanduan, RankingEntry } from '@/types/hasil.types';
import { DEFAULT_KATEGORI_KETERANGAN } from '@/types/hasil.types';

export interface RankingTableProps {
  /** Daftar ranking sudah terurut dari HasilRanking.ranking */
  ranking: RankingEntry[];
  /** Tampilkan kolom nilai kriteria C1..C5 */
  showKriteriaValues?: boolean;
  /** Tampilkan kolom S dan R */
  showSR?: boolean;
  /** State loading saat perhitungan berlangsung */
  loading?: boolean;
  /** Judul tabel opsional */
  title?: string;
  /** Callback tombol cetak / ekspor laporan */
  onCetakLaporan?: () => void;
}

type SortKey = 'rank' | 'Q' | 'S' | 'R' | 'nama';
type SortDir = 'asc' | 'desc';

const KATEGORI_STYLE: Record<KategoriKecanduan, { bg: string; fg: string }> = {
  Rendah: { bg: '#dcfce7', fg: '#166534' },
  Sedang: { bg: '#fef9c3', fg: '#854d0e' },
  Tinggi: { bg: '#ffedd5', fg: '#9a3412' },
  'Sangat Tinggi': { bg: '#fee2e2', fg: '#991b1b' },
};

export function getKategoriStyle(kategori: KategoriKecanduan): { bg: string; fg: string } {
  return KATEGORI_STYLE[kategori];
}

export function RankingTable({
  ranking,
  showKriteriaValues = true,
  showSR = true,
  loading = false,
  title = 'Ranking Mahasiswa — Hasil Identifikasi (VIKOR)',
  onCetakLaporan,
}: RankingTableProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState<'Semua' | KategoriKecanduan>('Semua');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const keteranganMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k of DEFAULT_KATEGORI_KETERANGAN) m[k.kategori] = k.warna;
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = [...ranking];
    if (filterKategori !== 'Semua') {
      rows = rows.filter((r) => r.kategoriKecanduan === filterKategori);
    }
    if (q) {
      rows = rows.filter(
        (r) =>
          r.alternativeName.toLowerCase().includes(q) ||
          r.alternativeId.toLowerCase().includes(q) ||
          (r.mahasiswaData?.nim || '').toLowerCase().includes(q) ||
          (r.mahasiswaData?.nama || '').toLowerCase().includes(q)
      );
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      switch (sortKey) {
        case 'Q':
          return (a.Q - b.Q) * dir;
        case 'S':
          return (a.S - b.S) * dir;
        case 'R':
          return (a.R - b.R) * dir;
        case 'nama':
          return a.alternativeName.localeCompare(b.alternativeName) * dir;
        case 'rank':
        default:
          return (a.rank - b.rank) * dir;
      }
    });
    return rows;
  }, [ranking, search, filterKategori, sortKey, sortDir]);

  const toggleSort = (key: SortKey): void => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'nama' ? 'asc' : 'asc');
    }
  };

  const sortLabel = (key: SortKey): string => {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  if (loading) {
    return (
      <div className="rounded-lg border p-6 text-sm" style={{ backgroundColor: '#f8fafc' }}>
        Menghitung ranking VIKOR...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header + kontrol */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {onCetakLaporan && (
          <button
            type="button"
            onClick={onCetakLaporan}
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: '#16a34a', color: 'white' }}
          >
            Cetak Laporan
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / NIM..."
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: '#d1d5db', minWidth: '220px' }}
        />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value as 'Semua' | KategoriKecanduan)}
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: '#d1d5db' }}
        >
          <option value="Semua">Semua Kategori</option>
          <option value="Rendah">Rendah</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
          <option value="Sangat Tinggi">Sangat Tinggi</option>
        </select>
        <span className="self-center text-xs" style={{ color: '#6b7280' }}>
          {filtered.length} dari {ranking.length} mahasiswa
        </span>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f3f4f6' }}>
            <tr>
              <th className="px-3 py-2 text-left">
                <button type="button" onClick={() => toggleSort('rank')}>
                  Rank{sortLabel('rank')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">NIM</th>
              <th className="px-3 py-2 text-left">
                <button type="button" onClick={() => toggleSort('nama')}>
                  Nama{sortLabel('nama')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">Prodi</th>
              <th className="px-3 py-2 text-left">Angkatan</th>
              {showKriteriaValues && (
                <>
                  <th className="px-3 py-2 text-right">C1</th>
                  <th className="px-3 py-2 text-right">C2</th>
                  <th className="px-3 py-2 text-right">C3</th>
                  <th className="px-3 py-2 text-right">C4</th>
                  <th className="px-3 py-2 text-right">C5</th>
                </>
              )}
              {showSR && (
                <>
                  <th className="px-3 py-2 text-right">
                    <button type="button" onClick={() => toggleSort('S')}>
                      S{sortLabel('S')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right">
                    <button type="button" onClick={() => toggleSort('R')}>
                      R{sortLabel('R')}
                    </button>
                  </th>
                </>
              )}
              <th className="px-3 py-2 text-right">
                <button type="button" onClick={() => toggleSort('Q')}>
                  Q{sortLabel('Q')}
                </button>
              </th>
              <th className="px-3 py-2 text-left">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showKriteriaValues && showSR ? 13 : 8}
                  className="px-3 py-6 text-center text-sm"
                  style={{ color: '#6b7280' }}
                >
                  Belum ada data ranking. Hitung hasil identifikasi terlebih dahulu.
                </td>
              </tr>
            )}
            {filtered.map((r) => {
              const style = getKategoriStyle(r.kategoriKecanduan);
              const dot = keteranganMap[r.kategoriKecanduan] || style.bg;
              return (
                <tr key={r.alternativeId} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td className="px-3 py-2 font-semibold">#{r.rank}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {r.mahasiswaData?.nim || r.alternativeId}
                  </td>
                  <td className="px-3 py-2">{r.alternativeName}</td>
                  <td className="px-3 py-2">{r.mahasiswaData?.prodi || '-'}</td>
                  <td className="px-3 py-2">{r.mahasiswaData?.angkatan || '-'}</td>
                  {showKriteriaValues && (
                    <>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.originalValues.C1}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.originalValues.C2}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.originalValues.C3}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.originalValues.C4}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.originalValues.C5}
                      </td>
                    </>
                  )}
                  {showSR && (
                    <>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.S.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {r.R.toFixed(4)}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                    {r.Q.toFixed(4)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
                      style={{ backgroundColor: style.bg, color: style.fg }}
                      title={r.kategoriKecanduan}
                    >
                      <span
                        className="inline-block rounded-full"
                        style={{ width: '8px', height: '8px', backgroundColor: dot }}
                      />
                      {r.kategoriKecanduan}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs" style={{ color: '#6b7280' }}>
        Ranking diurut berdasarkan nilai Q VIKOR (terkecil = peringkat 1). Kategori ditentukan dari
        rentang Q: Rendah (0–0,25), Sedang (0,25–0,5), Tinggi (0,5–0,75), Sangat Tinggi (0,75–1).
      </p>
    </div>
  );
}

export default RankingTable;
