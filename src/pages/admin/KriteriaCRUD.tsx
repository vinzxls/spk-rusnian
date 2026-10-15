import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export function KriteriaCRUD() {
  const { user, hasRole } = useAuth()

  if (!hasRole('admin')) {
    return <p className="text-red-600">Akses ditolak</p>
  }

  return (
    <DashboardLayout role="admin" pageTitle="Kriteria & Subkriteria" pageDesc="Pengelolaan kriteria penelitian AHP + VIKOR">
      <div className="ds-grid ds-grid-2 ds-gap-4 mb-6">
        <div>
          <h3 className="ds-h4">Kriteria (C1–C5)</h3>
          <p className="ds-body-sm">Tabel daftar kriteria penelitian.</p>
          <a href="#" className="ds-btn ds-btn-primary ds-btn-sm">Kelola Kriteria</a>
        </div>
        <div>
          <h3 className="ds-h4">Subkriteria (A1–A5)</h3>
          <p className="ds-body-sm">5 subkriteria per kriteria dengan skala 1–5.</p>
          <a href="#" className="ds-btn ds-btn-primary ds-btn-sm">Kelola Subkriteria</a>
        </div>
      </div>

      <hr className="my-6" />

      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Penjelasan</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Kriteria C1 (Durasi), C2 (Frekuensi), C3 (Ketergantungan), C4 (Gangguan Akademik), C5
            (Fear of Missing Out). Setiap kriteria memiliki 5 subkriteria A1 (Sangat Rendah) hingga A5
            (Sangat Tinggi) berdasarkan skala penelitian.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}