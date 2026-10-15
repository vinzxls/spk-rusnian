import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export function HasilIdentifikasi() {
  const { hasRole } = useAuth()

  if (!hasRole('admin')) {
    return <p className="text-red-600">Akses ditolak</p>
  }

  return (
    <DashboardLayout role="admin" pageTitle="Hasil Identifikasi" pageDesc="Hasil perhitungan AHP + VIKOR per mahasiswa">
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Ringkasan</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Lihat hasil identifikasi berdasarkan nilai Q VIKOR dengan pembobotan dari AHP.
            Kategori: Rendah (Q≤0.25), Sedang (0.25&lt;Q≤0.5), Tinggi (0.5&lt;Q≤0.75), Sangat Tinggi (Q&gt;0.75).
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}