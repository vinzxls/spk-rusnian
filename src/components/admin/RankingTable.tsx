/**
 * RankingTable — tabel perangkingan mahasiswa berdasarkan nilai Q (VIKOR).
 *
 * Fitur: cari (nama/NIM), filter kategori, sortir kolom Rank/S/R/Q, serta
 * kolom nilai kriteria C1–C5. Styling memakai design system (.ds-*), bukan
 * Tailwind, karena proyek ini tidak memasang Tailwind.
 */
import { useMemo, useState } from 'react'
import type { KategoriKecanduan, RankingEntry } from '@/types/hasil.types'
import { badgeKategori } from '@/utils/badge'

export interface RankingTableProps {
  ranking: RankingEntry[]
  showKriteriaValues?: boolean
  showSR?: boolean
  loading?: boolean
  title?: string
  onCetakLaporan?: () => void
  /** Klik baris → detail. Opsional. */
  onPilih?: (entry: RankingEntry) => void
}

type SortKey = 'rank' | 'Q' | 'S' | 'R' | 'nama'
type SortDir = 'asc' | 'desc'

export function RankingTable({
  ranking,
  showKriteriaValues = true,
  showSR = true,
  loading = false,
  title = 'Ranking Mahasiswa (VIKOR)',
  onCetakLaporan,
  onPilih,
}: RankingTableProps) {
  const [search, setSearch] = useState('')
  const [filterKategori, setFilterKategori] = useState<'Semua' | KategoriKecanduan>('Semua')
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = [...ranking]

    if (filterKategori !== 'Semua') {
      rows = rows.filter((r) => r.kategoriKecanduan === filterKategori)
    }

    if (q) {
      rows = rows.filter(
        (r) =>
          r.alternativeName.toLowerCase().includes(q) ||
          r.alternativeId.toLowerCase().includes(q) ||
          (r.mahasiswaData?.nim || '').toLowerCase().includes(q)
      )
    }

    const dir = sortDir === 'asc' ? 1 : -1
    rows.sort((a, b) => {
      switch (sortKey) {
        case 'Q':
          return (a.Q - b.Q) * dir
        case 'S':
          return (a.S - b.S) * dir
        case 'R':
          return (a.R - b.R) * dir
        case 'nama':
          return a.alternativeName.localeCompare(b.alternativeName, 'id') * dir
        case 'rank':
        default:
          return (a.rank - b.rank) * dir
      }
    })

    return rows
  }, [ranking, search, filterKategori, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const panah = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '')

  const kolom = 6 + (showKriteriaValues ? 5 : 0) + (showSR ? 2 : 0) + 2

  if (loading) {
    return (
      <div className="ds-card">
        <div className="ds-card-content">
          <p className="ds-body-sm">Menghitung ranking VIKOR...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ds-card">
      <div className="ds-card-header" style={{ flexWrap: 'wrap' }}>
        <h3 className="ds-card-title">{title}</h3>
        {onCetakLaporan && (
          <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={onCetakLaporan}>
            Buat Laporan
          </button>
        )}
      </div>

      <div className="ds-card-content">
        <div className="ds-flex ds-gap-2 ds-mb-4" style={{ flexWrap: 'wrap' }}>
          <input
            type="search"
            className="ds-input"
            style={{ maxWidth: 260 }}
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Cari mahasiswa pada tabel ranking"
          />
          <select
            className="ds-select"
            style={{ maxWidth: 200 }}
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value as 'Semua' | KategoriKecanduan)}
            aria-label="Filter kategori kecanduan"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sangat Tinggi">Sangat Tinggi</option>
          </select>
          <span className="ds-caption" style={{ alignSelf: 'center' }}>
            {filtered.length} dari {ranking.length} mahasiswa
          </span>
        </div>

        {ranking.length === 0 ? (
          <div className="ds-empty">
            <p className="ds-empty-title">Belum ada hasil perhitungan</p>
            <p className="ds-empty-desc">
              Ranking muncul setelah ada mahasiswa yang mengisi kuesioner.
            </p>
          </div>
        ) : (
          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => toggleSort('rank')}>
                      Rank{panah('rank')}
                    </button>
                  </th>
                  <th>NIM</th>
                  <th>
                    <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => toggleSort('nama')}>
                      Nama{panah('nama')}
                    </button>
                  </th>
                  <th>Prodi</th>
                  <th>Angkatan</th>
                  {showKriteriaValues &&
                    ['C1', 'C2', 'C3', 'C4', 'C5'].map((k) => (
                      <th key={k} style={{ textAlign: 'right' }}>
                        {k}
                      </th>
                    ))}
                  {showSR && (
                    <>
                      <th style={{ textAlign: 'right' }}>
                        <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => toggleSort('S')}>
                          S{panah('S')}
                        </button>
                      </th>
                      <th style={{ textAlign: 'right' }}>
                        <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => toggleSort('R')}>
                          R{panah('R')}
                        </button>
                      </th>
                    </>
                  )}
                  <th style={{ textAlign: 'right' }}>
                    <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => toggleSort('Q')}>
                      Q{panah('Q')}
                    </button>
                  </th>
                  <th>Kategori</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={kolom} style={{ textAlign: 'center' }}>
                      Tidak ada mahasiswa yang cocok dengan filter.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr
                    key={r.alternativeId}
                    onClick={onPilih ? () => onPilih(r) : undefined}
                    style={onPilih ? { cursor: 'pointer' } : undefined}
                  >
                    <td className="font-mono">#{r.rank}</td>
                    <td className="font-mono">{r.mahasiswaData?.nim || r.alternativeId}</td>
                    <td>{r.alternativeName}</td>
                    <td>{r.mahasiswaData?.prodi || '-'}</td>
                    <td>{r.mahasiswaData?.angkatan || '-'}</td>
                    {showKriteriaValues &&
                      (['C1', 'C2', 'C3', 'C4', 'C5'] as const).map((k) => (
                        <td key={k} style={{ textAlign: 'right' }} className="font-mono">
                          {r.originalValues[k].toFixed(2)}
                        </td>
                      ))}
                    {showSR && (
                      <>
                        <td style={{ textAlign: 'right' }} className="font-mono">
                          {r.S.toFixed(4)}
                        </td>
                        <td style={{ textAlign: 'right' }} className="font-mono">
                          {r.R.toFixed(4)}
                        </td>
                      </>
                    )}
                    <td style={{ textAlign: 'right' }} className="font-mono">
                      {r.Q.toFixed(4)}
                    </td>
                    <td>
                      <span className={badgeKategori(r.kategoriKecanduan)}>
                        <span className="ds-badge-dot" />
                        {r.kategoriKecanduan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="ds-caption" style={{ marginTop: 12 }}>
          Q terkecil = peringkat 1. Kategori: Rendah (Q ≤ 0,25), Sedang (≤ 0,5), Tinggi (≤ 0,75),
          Sangat Tinggi (&gt; 0,75).
        </p>
      </div>
    </div>
  )
}

export default RankingTable
