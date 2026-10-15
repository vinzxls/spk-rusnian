import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export function KuesionerFormPage() {
  const { hasRole } = useAuth()

  if (!hasRole('mahasiswa')) {
    return <p className="text-red-600">Akses ditolak — hanya mahasiswa.</p>
  }

  return (
    <DashboardLayout
      role="mahasiswa"
      pageTitle="Pengisian Kuesioner"
      pageDesc="Isi jawaban 5 kriteria × skala 1–5"
    >
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Form Kuesioner</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Formulir kuesioner (5 kriteria, skala 1–5 per subkriteria) akan ditampilkan di sini.
            Setelah mengisi semua, jawaban dikirim dan disimpan ke database.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}