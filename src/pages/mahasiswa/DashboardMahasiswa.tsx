import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'

export function DashboardMahasiswa() {
  const { user } = useAuth()

  return (
    <DashboardLayout
      role="mahasiswa"
      pageTitle="Dashboard Mahasiswa"
      pageDesc="Status pengisian kuesioner kecanduan media sosial"
    >
      <div className="ds-card">
        <div className="ds-card-header">
          <div>
            <h3 className="ds-card-title">Selamat Datang</h3>
            <p className="ds-card-description">Halo, {user?.nama_lengkap || user?.username}.</p>
          </div>
        </div>
        <div className="ds-card-content">
          <p className="ds-body-sm" style={{ marginBottom: 12 }}>
            Silakan isi kuesioner berdasarkan 5 kriteria: Durasi, Frekuensi, Ketergantungan,
            Gangguan Akademik, dan FoMO. Setiap kriteria memiliki 5 subkriteria (skala 1–5).
          </p>
          <a href="/mahasiswa/kuesioner" className="ds-btn ds-btn-primary">
            Isi Kuesioner Sekarang
          </a>
        </div>
      </div>

      <div className="ds-card" style={{ marginTop: 16 }}>
        <div className="ds-card-header">
          <div>
            <h3 className="ds-card-title">Status Kuesioner</h3>
            <p className="ds-card-description">Riwayat pengisian Anda</p>
          </div>
          <span className="ds-badge ds-badge-pending">Belum Mengisi</span>
        </div>
        <div className="ds-card-content">
          <div className="ds-empty">
            <div className="ds-empty-icon">📝</div>
            <p className="ds-empty-title">Belum ada kuesioner yang diisi</p>
            <p className="ds-empty-desc">Klik tombol di atas untuk mulai mengisi kuesioner.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
