import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { kuesionerService } from '@/services/kuesioner.service'
import { gabungAHPdanVIKOR } from '@/services/hasil-identifikasi.service'
import { generateLaporanData, generateLaporanPDFConcept } from '@/services/laporan.service'
import { makeCriteriaWeight } from '@/utils/ahp-calculator'
import { buildMahasiswaMap, toKuesionerJawaban } from '@/utils/kuesioner-mapper'
import type { LaporanData } from '@/types/hasil.types'

/**
 * Bobot setara dipakai karena halaman Kriteria belum menyimpan hasil
 * perbandingan berpasangan. Begitu form AHP disambungkan, ganti dengan
 * hasil computeAHP(...).weights.
 */
const BOBOT_SETARA = makeCriteriaWeight([0.2, 0.2, 0.2, 0.2, 0.2])

export function LaporanPage() {
  const { user, hasRole } = useAuth()
  const [laporan, setLaporan] = useState<LaporanData | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!hasRole('admin')) {
    return <p className="ds-text-danger">Akses ditolak</p>
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setPesan(null)

    try {
      const jawaban = await kuesionerService.getAll()

      if (jawaban.length === 0) {
        setLaporan(null)
        setPesan('Belum ada kuesioner yang diisi mahasiswa, jadi laporan belum bisa dibuat.')
        return
      }

      const mahasiswaMap = await buildMahasiswaMap()
      const hasil = gabungAHPdanVIKOR({
        bobotAHP: BOBOT_SETARA,
        jawabanKuesioner: toKuesionerJawaban(jawaban),
        mahasiswaMap,
      })

      const data = generateLaporanData({
        hasilRanking: hasil,
        dicetakOleh: user?.nama_lengkap || user?.username || 'Admin',
        header: {
          institusi: 'Universitas Pattimura',
          fakultas: 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
          programStudi: 'Ilmu Komputer',
        },
      })

      setLaporan(data)

      const { html, metadata } = generateLaporanPDFConcept(data)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const jendela = window.open(url, '_blank')

      if (!jendela) {
        // Pop-up diblokir: sediakan unduhan sebagai jalan lain.
        const link = document.createElement('a')
        link.href = url
        link.download = metadata.filename
        link.click()
        setPesan(`Laporan dibuat untuk ${data.ringkasan.totalMahasiswa} mahasiswa. Pop-up diblokir, file diunduh sebagai ${metadata.filename}.`)
      } else {
        setPesan(`Laporan dibuat untuk ${data.ringkasan.totalMahasiswa} mahasiswa dan dibuka di tab baru.`)
      }
    } catch (e) {
      setLaporan(null)
      setPesan(e instanceof Error ? e.message : 'Gagal membuat laporan.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout role="admin" pageTitle="Laporan" pageDesc="Cetak laporan hasil identifikasi">
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Cetak Laporan</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Generate laporan dalam format HTML (siap export ke PDF). Laporan berisi ringkasan,
            tabel ranking, bobot kriteria AHP, dan keterangan kategori kecanduan.
          </p>
          <button
            type="button"
            className="ds-btn ds-btn-primary"
            style={{ marginTop: 12 }}
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? 'Membuat laporan...' : 'Generate Laporan'}
          </button>

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
