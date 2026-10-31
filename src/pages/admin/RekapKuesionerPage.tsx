/**
 * RekapKuesionerPage — daftar mahasiswa yang sudah/belum menyelesaikan kuesioner.
 *
 * Kolom: status pengisian, jumlah pertanyaan terjawab, total skor kuesioner,
 * skor AHP, nilai C1–C5, serta S/R/Q VIKOR. Bisa diekspor ke Excel.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { badgeKategori } from '@/utils/badge'
import { useAuth } from '@/hooks/useAuth'
import {
  buildRekap,
  formatTanggal,
  TOTAL_PERTANYAAN,
  SKOR_MAX,
  type RekapResult,
  type RekapRow,
} from '@/services/rekap.service'
import { exportRekapExcel } from '@/services/rekap-excel'
import { loadAhp } from '@/services/ahp-store'
import { CRITERIA_LIST } from '@/types/ahp.types'
import { ClipboardCheck, ClipboardX, Award, Download, TrendingUp } from 'lucide-react'

type FilterStatus = 'Semua' | 'Selesai' | 'Belum'

const KRITERIA_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const

export function RekapKuesionerPage() {
  const { hasRole } = useAuth()
  const [rekap, setRekap] = useState<RekapResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)
  const [cari, setCari] = useState('')
  const [status, setStatus] = useState<FilterStatus>('Semua')

  const muat = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRekap(await buildRekap())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat rekap kuesioner.')
      setRekap(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasRole('admin')) void muat()
  }, [hasRole, muat])

  const tersaring = useMemo(() => {
    const rows = rekap?.rows ?? []
    const q = cari.trim().toLowerCase()

    return rows.filter((r) => {
      if (status !== 'Semua' && r.status !== status) return false
      if (!q) return true
      return (
        r.nim.toLowerCase().includes(q) ||
        r.nama.toLowerCase().includes(q) ||
        r.prodi.toLowerCase().includes(q)
      )
    })
  }, [rekap, cari, status])

  const ekspor = () => {
    if (!rekap) return
    try {
      const konsistensi = loadAhp()?.consistency
      const nama = exportRekapExcel(rekap, { konsistensi })
      setPesan(`File Excel dibuat: ${nama} (3 sheet).`)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat file Excel.')
    }
  }

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  const rows = rekap?.rows ?? []
  const selesai = rows.filter((r) => r.status === 'Selesai')
  const belum = rows.length - selesai.length
  const rataSkor = selesai.length
    ? selesai.reduce((sum, r) => sum + r.skorAHP, 0) / selesai.length
    : 0
  const terbaik = selesai.length
    ? selesai.reduce((min, r) => (r.skorAHP < min.skorAHP ? r : min), selesai[0])
    : null

  return (
    <DashboardLayout
      role="admin"
      pageTitle="Rekap Kuesioner"
      pageDesc="Pantau mahasiswa yang sudah menyelesaikan kuesioner beserta skornya"
    >
      <div className="ds-grid ds-grid-4 ds-gap-4 ds-mb-6">
        <StatCard
          icon={<ClipboardCheck />}
          title="Sudah Mengisi"
          value={loading ? '...' : selesai.length}
          color="success"
          hint={`Dari ${rows.length} mahasiswa terdaftar`}
        />
        <StatCard
          icon={<ClipboardX />}
          title="Belum Mengisi"
          value={loading ? '...' : belum}
          color="warning"
          hint="Perlu ditagih"
        />
        <StatCard
          icon={<TrendingUp />}
          title="Rata-rata Skor AHP"
          value={loading ? '...' : rataSkor.toFixed(3)}
          color="primary"
          hint={`Skala 1–${SKOR_MAX / TOTAL_PERTANYAAN}`}
        />
        <StatCard
          icon={<Award />}
          title="Skor Terendah"
          value={loading || !terbaik ? '...' : terbaik.skorAHP.toFixed(3)}
          color="danger"
          hint={terbaik ? terbaik.nama : 'Belum ada data'}
        />
      </div>

      {rekap && !rekap.bobotDariAHP && (
        <div className="ds-alert ds-alert-warning ds-mb-4">
          <div>
            <p className="ds-alert-title">Skor AHP masih memakai bobot setara</p>
            <p className="ds-alert-body">
              Isi perbandingan berpasangan di halaman Pembobotan AHP agar skor AHP mencerminkan
              prioritas kriteria yang sebenarnya.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="ds-alert ds-alert-danger ds-mb-4" role="alert">
          <p className="ds-alert-body">{error}</p>
        </div>
      )}

      {pesan && (
        <div className="ds-alert ds-alert-success ds-mb-4" role="status">
          <p className="ds-alert-body">{pesan}</p>
        </div>
      )}

      <div className="ds-card">
        <div className="ds-card-header" style={{ flexWrap: 'wrap' }}>
          <div>
            <h3 className="ds-card-title">Daftar Pengisian Kuesioner</h3>
            <p className="ds-card-description">
              Total skor = jumlah 25 jawaban (rentang {TOTAL_PERTANYAAN}–{SKOR_MAX}). Skor AHP =
              Σ bobot kriteria × nilai kriteria.
            </p>
          </div>
          <div className="ds-flex ds-gap-2" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-sm"
              onClick={() => void muat()}
              disabled={loading}
            >
              {loading ? 'Memuat...' : 'Muat Ulang'}
            </button>
            <button
              type="button"
              className="ds-btn ds-btn-primary ds-btn-sm"
              onClick={ekspor}
              disabled={loading || rows.length === 0}
            >
              <Download size={14} /> Export Excel
            </button>
          </div>
        </div>

        <div className="ds-card-content">
          <div className="ds-flex ds-gap-2 ds-mb-4" style={{ flexWrap: 'wrap' }}>
            <input
              type="search"
              className="ds-input"
              style={{ maxWidth: 260 }}
              placeholder="Cari nama, NIM, atau prodi..."
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              aria-label="Cari mahasiswa pada rekap"
            />
            <select
              className="ds-select"
              style={{ maxWidth: 180 }}
              value={status}
              onChange={(e) => setStatus(e.target.value as FilterStatus)}
              aria-label="Filter status pengisian"
            >
              <option value="Semua">Semua Status</option>
              <option value="Selesai">Sudah Mengisi</option>
              <option value="Belum">Belum Mengisi</option>
            </select>
            <span className="ds-caption" style={{ alignSelf: 'center' }}>
              {tersaring.length} dari {rows.length} mahasiswa
            </span>
          </div>

          <div className="ds-table-wrapper">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Angkatan</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Terjawab</th>
                  <th style={{ textAlign: 'right' }}>Total Skor</th>
                  <th style={{ textAlign: 'right' }}>Skor AHP</th>
                  {KRITERIA_KEYS.map((k) => (
                    <th key={k} style={{ textAlign: 'right' }}>
                      {k}
                    </th>
                  ))}
                  <th style={{ textAlign: 'right' }}>Q</th>
                  <th style={{ textAlign: 'right' }}>Rank</th>
                  <th>Kategori</th>
                  <th>Waktu Submit</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={16} style={{ textAlign: 'center' }}>
                      Memuat data kuesioner...
                    </td>
                  </tr>
                )}

                {!loading && tersaring.length === 0 && (
                  <tr>
                    <td colSpan={16} style={{ textAlign: 'center' }}>
                      {rows.length === 0
                        ? 'Belum ada mahasiswa terdaftar.'
                        : 'Tidak ada mahasiswa yang cocok dengan filter.'}
                    </td>
                  </tr>
                )}

                {!loading &&
                  tersaring.map((r: RekapRow, i) => (
                    <tr key={r.mahasiswaId}>
                      <td className="font-mono">{i + 1}</td>
                      <td className="font-mono">{r.nim}</td>
                      <td>{r.nama}</td>
                      <td>{r.angkatan}</td>
                      <td>
                        <span
                          className={`ds-badge ${
                            r.status === 'Selesai' ? 'ds-badge-success' : 'ds-badge-warning'
                          }`}
                        >
                          <span className="ds-badge-dot" />
                          {r.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {r.terjawab}/{TOTAL_PERTANYAAN}
                      </td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {r.status === 'Selesai' ? r.totalSkor : '-'}
                      </td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        <strong>{r.status === 'Selesai' ? r.skorAHP.toFixed(4) : '-'}</strong>
                      </td>
                      {KRITERIA_KEYS.map((k) => (
                        <td key={k} style={{ textAlign: 'right' }} className="font-mono">
                          {r.status === 'Selesai' ? r.nilai[k].toFixed(2) : '-'}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {r.Q === null ? '-' : r.Q.toFixed(4)}
                      </td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {r.rank ?? '-'}
                      </td>
                      <td>
                        {r.kategori ? (
                          <span className={badgeKategori(r.kategori)}>
                            <span className="ds-badge-dot" />
                            {r.kategori}
                          </span>
                        ) : (
                          <span className="ds-text-muted">-</span>
                        )}
                      </td>
                      <td className="ds-caption">{formatTanggal(r.submittedAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="ds-caption" style={{ marginTop: 12 }}>
            Skor AHP: {CRITERIA_LIST.map((c) => c.code).join(' · ')} — nilai tiap kriteria adalah
            rata-rata 5 subkriterianya. Q dan Rank hanya terisi untuk mahasiswa yang sudah mengisi.
          </p>
        </div>
      </div>

      {rekap && rekap.catatan.length > 0 && (
        <div className="ds-card" style={{ marginTop: 16 }}>
          <div className="ds-card-header">
            <h3 className="ds-card-title">Catatan Perhitungan</h3>
          </div>
          <div className="ds-card-content">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {rekap.catatan.map((c) => (
                <li key={c} className="ds-body-sm" style={{ marginBottom: 6 }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default RekapKuesionerPage
