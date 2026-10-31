import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LandingPage } from './components/landing'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardAdmin } from './pages/admin/DashboardAdmin'
import { DashboardMahasiswa } from './pages/mahasiswa/DashboardMahasiswa'
import { MahasiswaCRUD } from './pages/admin/MahasiswaCRUD'
import { KriteriaCRUD } from './pages/admin/KriteriaCRUD'
import { HasilIdentifikasi } from './pages/admin/HasilIdentifikasi'
import { RankingPage } from './pages/admin/RankingPage'
import { LaporanPage } from './pages/admin/LaporanPage'
import { KuesionerFormPage } from './pages/mahasiswa/KuesionerFormPage'

const homeFor = (role: string) => (role === 'admin' ? '/admin/dashboard' : '/mahasiswa/dashboard')

function ProtectedRoute({ allowed, children }: { allowed: string[]; children: JSX.Element }) {
  const { user, isLoading } = useAuth()

  // Jangan redirected sebelum sesi tersimpan selesai dibaca — ini yang dulu
  // memicu loop /login ⇄ /admin/dashboard.
  if (isLoading) return <div className="ds-empty">Memuat...</div>
  if (!user) return <Navigate to="/login" replace />
  if (!allowed.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return children
}

export default function App() {
  const { user, login, isLoading } = useAuth()

  if (isLoading) {
    return <div className="ds-empty">Memuat...</div>
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={homeFor(user.role)} replace /> : <LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to={homeFor(user.role)} replace /> : <LoginPage onLogin={login} />}
      />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowed={['admin']}><DashboardAdmin /></ProtectedRoute>} />
      <Route path="/admin/mahasiswa" element={<ProtectedRoute allowed={['admin']}><MahasiswaCRUD /></ProtectedRoute>} />
      <Route path="/admin/kriteria" element={<ProtectedRoute allowed={['admin']}><KriteriaCRUD /></ProtectedRoute>} />
      <Route path="/admin/hasil-identifikasi" element={<ProtectedRoute allowed={['admin']}><HasilIdentifikasi /></ProtectedRoute>} />
      <Route path="/admin/ranking" element={<ProtectedRoute allowed={['admin']}><RankingPage /></ProtectedRoute>} />
      <Route path="/admin/laporan" element={<ProtectedRoute allowed={['admin']}><LaporanPage /></ProtectedRoute>} />

      <Route path="/mahasiswa/dashboard" element={<ProtectedRoute allowed={['mahasiswa']}><DashboardMahasiswa /></ProtectedRoute>} />
      <Route path="/mahasiswa/kuesioner" element={<ProtectedRoute allowed={['mahasiswa']}><KuesionerFormPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
