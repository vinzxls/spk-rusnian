import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export function RankingPage() {
  const { hasRole } = useAuth()

  if (!hasRole('admin')) {
    return <p className="text-red-600">Akses ditolak</p>
  }

  return (
    <DashboardLayout role="admin" pageTitle="Ranking Mahasiswa" pageDesc="Perangkingan berdasarkan indeks Q VIKOR">
      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Tabel Ranking</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">
            Ranking ditampilkan berdasarkan nilai Q terkecil (Rank 1 = terbaik / tingkat kecanduan terendah
            sesuai pendekatan VIKOR). Interpretasi kategori berdasarkan rentang Q standar.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}