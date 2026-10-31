import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { useHasilRanking } from '@/hooks/useHasilRanking'
import { generateLaporanData, generateLaporanPDFConcept } from '@/services/laporan.service'
import { loadAhp } from '@/services/ahp-store'
import type { LaporanData } from '@/types/hasil.types'

export function LaporanPage() {
  const { user, hasRole } = useAuth()
  const { hasil, loading, error, jumlahResponden, bobotDariAHP } = useHasilRanking()
  const [laporan, setLaporan] = useState<LaporanData | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  const handleGenerate = () => {
    setPesan(null)

    if (!hasil || hasil.ranking.length === 0) {
      setLaporan(null)
      setPesan('Belum ada kuesioner yang diisi mahasiswa, jadi laporan belum bisa dibuat.')
      return
    }

    try {
      const data = generateLaporanData({
        hasilRanking: hasil,
        dicetakOleh: user?.nama_lengkap || user?.username || 'Admin',
        header: {
          institusi: 'Universitas Pattimura',
          fakultas: 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
          programStudi: 'Ilmu Komputer',
        },
        catatan: bobotDariAHP
          ? 'Laporan ini dihasilkan berdasarkan perhitungan AHP + VIKOR dengan bobot kriteria hasil perbandingan berpasangan.'
          : 'Laporan ini dihasilkan berdasarkan perhitungan VIKOR dengan bobot kriteria setara (0,2 per kriteria) karena perbandingan berpasangan AHP belum diisi.',
      })

      setLaporan(data)

      const { html, metadata } = generateLaporanPDFConcept(data)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const jendela = window.open(url, '_blank')

      if (!jendela) {
        const link = document.createElement('a')
        link.href = url
        link.download = metadata.filename
        link.click()
        setPesan(
          `Laporan dibuat untuk ${data.ringkasan.totalMahasiswa} mahasiswa. Pop-up diblokir, file diunduh sebagai ${metadata.filename}.`
        )
      } else {
        setPesan(
          `Laporan dibuat untuk ${data.ringkasan.totalMahasiswa} mahasiswa dan dibuka di tab baru.`
        )
      }
    } catch (e) {
      setLaporan(null)
      setPesan(e instanceof Error ? e.message : 'Gagal membuat laporan.')
    }
  }

  const konsistensi = loadAhp()?.consistency

  return (
    <DashboardLayout role="admin" pageTitle="Laporan" pageDesc="Cetak laporan hasil identifikasi">
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Cetak Laporan</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Laporan berisi ringkasan kategori, bobot kriteria AHP yang dipakai, tabel ranking, dan
            keterangan kategori kecanduan. Dibuka sebagai HTML siap cetak / simpan PDF.
          </p>

          <div className="ds-table-wrapper ds-mt-4">
            <table className="ds-table">
              <tbody>
                <tr>
                  <td>Sumber bobot</td>
                  <td>
                    {bobotDariAHP ? (
                      <span className="ds-badge ds-badge-success">Perbandingan berpasangan AHP</span>
                    ) : (
                      <span className="ds-badge ds-badge-warning">Setara 0,2 (belum AHP)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Responden</td>
                  <td>{loading ? '...' : jumlahResponden}</td>
                </tr>
                <tr>
                  <td>Konsistensi AHP</td>
                  <td>
                    {konsistensi
                      ? `CR ${konsistensi.CR.toFixed(4)} — ${
                          konsistensi.isConsistent ? 'konsisten' : 'tidak konsisten'
                        }`
                      : 'Belum ada uji konsistensi'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ds-flex ds-gap-2 ds-mt-4" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ds-btn ds-btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Menghitung...' : 'Generate Laporan'}
            </button>
            {!bobotDariAHP && (
              <Link to="/admin/ahp" className="ds-btn ds-btn-secondary">
                Isi Bobot AHP
              </Link>
            )}
          </div>

          {error && (
            <p className="ds-text-danger ds-mt-4" role="alert">
              {error}
            </p>
          )}

          {pesan && (
            <p className="ds-caption" style={{ marginTop: 10 }} role="status">
              {pesan}
            </p>
          )}
        </div>
      </div>

      {laporan && (
        <div className="ds-card" style={{ marginTop: 16 }}>
          <div className="ds-card-header">
            <h3 className="ds-card-title">Ringkasan Laporan</h3>
          </div>
          <div className="ds-card-content">
            <div className="ds-grid ds-grid-4 ds-gap-4">
              <div>
                <p className="ds-stat-label">Total Mahasiswa</p>
                <p className="ds-stat-value">{laporan.ringkasan.totalMahasiswa}</p>
              </div>
              <div>
                <p className="ds-stat-label">Rendah</p>
                <p className="ds-stat-value">{laporan.ringkasan.rendah}</p>
              </div>
              <div>
                <p className="ds-stat-label">Sedang</p>
                <p className="ds-stat-value">{laporan.ringkasan.sedang}</p>
              </div>
              <div>
                <p className="ds-stat-label">Tinggi / Sangat Tinggi</p>
                <p className="ds-stat-value">
                  {laporan.ringkasan.tinggi} / {laporan.ringkasan.sangatTinggi}
                </p>
              </div>
            </div>

            <div className="ds-table-wrapper ds-mt-4">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Bobot</th>
                    <th style={{ textAlign: 'right' }}>Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {(['C1', 'C2', 'C3', 'C4', 'C5'] as const).map((k) => (
                    <tr key={k}>
                      <td className="font-mono">{k}</td>
                      <td>{`${(laporan.bobotKriteria[k] * 100).toFixed(2)}%`}</td>
                      <td style={{ textAlign: 'right' }} className="font-mono">
                        {laporan.bobotKriteria[k].toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="ds-caption" style={{ marginTop: 12 }}>
              Dicetak oleh {laporan.header.dicetakOleh} pada {laporan.header.tanggalCetak}.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default LaporanPage
