import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export function LaporanPage() {
  const { hasRole } = useAuth()

  if (!hasRole('admin')) {
    return <p className="text-red-600">Akses ditolak</p>
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
          <button className="ds-btn ds-btn-primary" style={{ marginTop: 12 }}>
            Generate Laporan
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}