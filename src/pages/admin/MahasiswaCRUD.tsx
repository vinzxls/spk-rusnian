import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Users, FileText, Trophy, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function MahasiswaCRUD() {
  const { user, hasRole } = useAuth()

  return (
    <div style={{ padding: 'var(--ds-space-8)' }}>
      <h2 className="ds-h2" style={{ marginBottom: 'var(--ds-space-4)' }}>
        Data Mahasiswa
      </h2>

      {hasRole('admin') ? (
        <div className="ds-grid ds-grid-3 ds-gap-4 mb-6">
          <StatCard icon={<Users />} title="Total Mahasiswa" value={5} color="primary" hint="Lihat semua" />
          <StatCard icon={<FileText />} title="Kuesioner Terisi" value={0} color="success" hint="Proses pengisian" />
          <StatCard icon={<Trophy />} title="Ranking" value={0} color="warning" hint="Belum dihitung" />
        </div>
      ) : (
        <p className="text-red-600">Akses ditolak</p>
      )}

      <hr className="my-6" />

      <div className="ds-card">
        <div className="ds-card-header">
          <h3 className="ds-card-title">Daftar Mahasiswa</h3>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm">Tabel data mahasiswa akan ditampilkan di sini.</p>
          <a href="/admin/mahasiswa/create" className="ds-btn ds-btn-primary ds-btn-sm">
            Tambah Mahasiswa Baru
          </a>
        </div>
      </div>
    </div>
  )
}